require(COMMON_SRC_ROOT + "utils/constants.js");
require(COMMON_SRC_ROOT + "classes/state_machine.js");

describe('state machine', function(){

  before(function(){
  });

  after(function(){
  });

  beforeEach(function(){
  });

  afterEach(function(){
  });

  it('should be defined', function(){
    expect(OO.StateMachine && (typeof OO.StateMachine === "object")).to.be.ok();
  });

  it('can be created', function(){
    var sm = OO.StateMachine.create({
      initial: 'Init',
      messageBus: {}
    });
    expect(sm).to.be.ok();
  });

  it('can be created with events and it will subscribe to message bus for those events', function(){
    var subscribed = false;
    var sm = OO.StateMachine.create({
      initial: 'Init',
      moduleName: 'testModule',
      messageBus: {
        subscribe : function(eventName, moduleName) {
          if(eventName == 'event_1' && moduleName == 'testModule') {
            subscribed = true;
          }
        }
      },
      events:[
        {name:'event_1',                       from:'Init',                                       to:'S1'}
      ]
    });
    expect(sm).to.be.ok();
    expect(subscribed).to.be.ok();
  });

  it('can properly route callbacks as needed', function() {
    var eventCallback = null;
    var triggerFired = {};

    var sm = OO.StateMachine.create({
      initial: 'Init',
      moduleName: 'testModule',
      messageBus: {
        subscribe : function(eventName, moduleName, callback) {
          eventCallback = callback;
        }
      },
      target: {
        onEvent1: function(trigger) {
          triggerFired[trigger] = true;
        },
        onS2: function(trigger) {
          triggerFired[trigger] = true;
        },
        onScopedEvent3: function(trigger) {
          triggerFired[trigger] = true;
        },
        onBadevent: function(trigger) {
          triggerFired[trigger] = true;
          return false;
        }
      },
      events:[
        {name:'event1',                       from:'Init',                                       to:'S1'},
        {name:'event2',                       from:'S1',                                        to:'S2'},
        {name:'scoped/event3',                       from:'S2',                                        to:'S2'},
        {name:'badevent',                       from:'S2',                                        to:'S3'}
      ]
    });
    expect(sm).to.be.ok();
    eventCallback('event1');
    eventCallback('event2');
    eventCallback('scoped/event3');
    eventCallback('event4');    // should be dropped magically
    eventCallback('badevent');    // should be ignored, since handler returns false
    expect(triggerFired.event1).to.be.ok();
    expect(triggerFired.S2).to.be.ok();
    expect(triggerFired['scoped/event3']).to.be.ok();
    expect(triggerFired['badevent']).to.be.ok();
    expect(sm.currentState).to.be('S2');
  });

  it('can properly resolve correct state based on event', function() {
    var eventCallback = null;
    var triggerFired = {};

    var target = {
      onS2: function(trigger) {
        triggerFired[trigger] = true;
      }
    };

    var sm = OO.StateMachine.create({
      initial: 'Init',
      moduleName: 'testModule',
      messageBus: {
        subscribe : function(eventName, moduleName, callback) {
          eventCallback = callback;
        }
      },
      target: target,
      events:[
        {name:'event1',                       from:'Init',                                       to:'S1'},
        {name:'event2',                       from:'Init',                                       to:'S2'},
      ]
    });

    expect(sm).to.be.ok();
    eventCallback('event2');
    expect(triggerFired.S2).to.be.ok();
    expect(target.currentState).to.be('S2');
  });

});
