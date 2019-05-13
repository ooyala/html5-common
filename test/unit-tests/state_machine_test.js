/* eslint-disable import/no-dynamic-require,require-jsdoc */
require(`${COMMON_SRC_ROOT}utils/constants.js`);
require(`${COMMON_SRC_ROOT}classes/state_machine.js`);

describe('state machine', () => {
  before(() => {
  });

  after(() => {
  });

  beforeEach(() => {
  });

  afterEach(() => {
  });

  it('should be defined', () => {
    expect(OO.StateMachine && (typeof OO.StateMachine === 'object')).to.be.ok();
  });

  it('can be created', () => {
    const sm = OO.StateMachine.create({
      initial: 'Init',
      messageBus: {},
    });
    expect(sm).to.be.ok();
  });

  it('can be created with events and it will subscribe to message bus for those events', () => {
    let subscribed = false;
    const sm = OO.StateMachine.create({
      initial: 'Init',
      moduleName: 'testModule',
      messageBus: {
        subscribe(eventName, moduleName) {
          if (eventName === 'event_1' && moduleName === 'testModule') {
            subscribed = true;
          }
        },
      },
      events: [
        { name: 'event_1', from: 'Init', to: 'S1' },
      ],
    });
    expect(sm).to.be.ok();
    expect(subscribed).to.be.ok();
  });

  it('can properly route callbacks as needed', () => {
    let eventCallback = null;
    const triggerFired = {};

    const sm = OO.StateMachine.create({
      initial: 'Init',
      moduleName: 'testModule',
      messageBus: {
        subscribe(eventName, moduleName, callback) {
          eventCallback = callback;
        },
      },
      target: {
        onEvent1(trigger) {
          triggerFired[trigger] = true;
        },
        onS2(trigger) {
          triggerFired[trigger] = true;
        },
        onScopedEvent3(trigger) {
          triggerFired[trigger] = true;
        },
        onBadevent(trigger) {
          triggerFired[trigger] = true;
          return false;
        },
      },
      events: [
        { name: 'event1', from: 'Init', to: 'S1' },
        { name: 'event2', from: 'S1', to: 'S2' },
        { name: 'scoped/event3', from: 'S2', to: 'S2' },
        { name: 'badevent', from: 'S2', to: 'S3' },
      ],
    });
    expect(sm).to.be.ok();
    eventCallback('event1');
    eventCallback('event2');
    eventCallback('scoped/event3');
    eventCallback('event4'); // should be dropped magically
    eventCallback('badevent'); // should be ignored, since handler returns false
    expect(triggerFired.event1).to.be.ok();
    expect(triggerFired.S2).to.be.ok();
    expect(triggerFired['scoped/event3']).to.be.ok();
    expect(triggerFired.badevent).to.be.ok();
    expect(sm.currentState).to.be('S2');
  });

  it('can properly resolve correct state based on event', () => {
    let eventCallback = null;
    const triggerFired = {};

    const target = {
      onS2(trigger) {
        triggerFired[trigger] = true;
      },
    };

    const sm = OO.StateMachine.create({
      initial: 'Init',
      moduleName: 'testModule',
      messageBus: {
        subscribe(eventName, moduleName, callback) {
          eventCallback = callback;
        },
      },
      target,
      events: [
        { name: 'event1', from: 'Init', to: 'S1' },
        { name: 'event2', from: 'Init', to: 'S2' },
      ],
    });

    expect(sm).to.be.ok();
    eventCallback('event2');
    expect(triggerFired.S2).to.be.ok();
    expect(target.currentState).to.be('S2');
  });
});
