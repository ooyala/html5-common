/* eslint-disable no-throw-literal,import/no-dynamic-require */
require(`${COMMON_SRC_ROOT}utils/utils.js`);
require(`${COMMON_SRC_ROOT}classes/emitter.js`);
require(`${COMMON_SRC_ROOT}classes/message_bus.js`);

describe('emitter', () => {
  let mb;
  let messageCalled;
  let callbackWithParam;
  let callback;

  before(() => {
  });

  after(() => {
  });

  beforeEach(() => {
    mb = new OO.MessageBus();
    messageCalled = {
      foo: false, foo1: false, foo2: false, foo3: false, foo4: false,
    };
    callback = function (eventName) {
      messageCalled[eventName] = true;
    };

    callbackWithParam = function (...args) {
      const [eventName, eventValue] = args;
      messageCalled[eventName] = eventValue;
    };
  });

  afterEach(() => {
  });

  it('should normal message get triggered', () => {
    mb.subscribe('foo', 'test', callback);
    expect(messageCalled.foo).to.equal(false);
    mb.publish('foo');
    expect(messageCalled.foo).to.equal(true);
  });

  it('should two mb work', () => {
    const mb1 = new OO.MessageBus();
    const messageCalled1 = {
      foo: false, foo1: false, foo2: false, foo3: false, foo4: false,
    };
    const callback1 = function (eventName) {
      messageCalled1[eventName] = true;
    };
    mb1.subscribe('foo', 'test', callback1);
    mb.subscribe('foo', 'test', callback);
    mb.publish('foo');
    expect(messageCalled.foo).to.equal(true);
    expect(messageCalled1.foo).to.equal(false);
  });

  it('should pass single param for simple case', () => {
    mb.subscribe('foo', 'test', callbackWithParam);
    expect(messageCalled.foo).to.equal(false);
    mb.publish('foo', { foo2: 'hello' });
    expect(messageCalled.foo).to.eql({ foo2: 'hello' });
  });

  it('should pass multiple params for simple case', () => {
    const callbackWithParams = function (...args) {
      messageCalled[args[0]] = args;
    };
    mb.subscribe('foo', 'test', callbackWithParams);
    expect(messageCalled.foo).to.equal(false);

    mb.publish('foo', { foo2: 'hello' }, true);
    expect(messageCalled.foo).to.eql({ 0: 'foo', 1: { foo2: 'hello' }, 2: true });

    mb.publish('foo', { foo3: 'hello1' }, 'hi');
    expect(messageCalled.foo).to.eql({ 0: 'foo', 1: { foo3: 'hello1' }, 2: 'hi' });
  });

  it('should not trigger callback if dependent is not ready', () => {
    mb.subscribe('foo', 'test', callback);
    mb.addDependent('foo', 'foo1', 'test', callback);
    expect(messageCalled.foo).to.equal(false);
    mb.publish('foo');
    expect(messageCalled.foo).to.equal(false);
  });

  it('should pass params should not care depedent order and override by dependent params', () => {
    mb.subscribe('foo', 'test', callbackWithParam);
    const overrideParam = function () {
      return { foo2: 'hello' };
    };
    mb.intercept('foo', 'test', overrideParam);
    mb.addDependent('foo', 'foo1', 'test');
    mb.publish('foo1');
    mb.publish('foo', { foo1: 'hello1' });

    expect(messageCalled.foo).to.eql({ foo2: 'hello' });
  });

  it('should not trigger callback when dependent is ready', () => {
    let fooCalled = false;

    const fooCallback = function () {
      fooCalled = true;
    };
    mb.subscribe('foo', 'test', fooCallback);
    mb.addDependent('foo', 'foo1', 'test', callback);
    expect(messageCalled.foo).to.equal(false);
    mb.publish('foo1');
    expect(fooCalled).to.equal(false);
    expect(messageCalled.foo).to.equal(false);
  });

  it('should trigger callback after dependent is ready', () => {
    mb.subscribe('foo', 'test', callback);
    mb.subscribe('foo1', 'test', callback);
    mb.addDependent('foo', 'foo1', 'test');
    expect(messageCalled.foo).to.equal(false);
    mb.publish('foo');
    expect(messageCalled.foo).to.equal(false);
    mb.publish('foo1');
    expect(messageCalled.foo).to.equal(true);
    expect(messageCalled.foo1).to.equal(true);
  });

  it('should trigger callback after dependent is ready, non-consecutive', () => {
    mb.subscribe('foo', 'test', callback);
    mb.subscribe('foo1', 'test', callback);
    mb.addDependent('foo', 'foo1', 'test');
    expect(messageCalled.foo).to.equal(false);
    mb.publish('foo');
    expect(messageCalled.foo).to.equal(false);
    mb.publish('foo2');
    mb.publish('foo1');
    expect(messageCalled.foo).to.equal(true);
    expect(messageCalled.foo1).to.equal(true);
  });

  it('should trigger callback after dependent is ready, two dependents, non-consecutive', () => {
    mb.subscribe('foo', 'test', callback);
    mb.subscribe('foo2', 'test', callback);
    mb.addDependent('foo', 'foo1', 'test', callback);
    mb.addDependent('foo2', 'foo3', 'test', callback);

    mb.publish('foo');
    mb.publish('foo2');
    expect(messageCalled.foo).to.equal(false);
    expect(messageCalled.foo2).to.equal(false);
    mb.publish('foo1');
    expect(messageCalled.foo).to.equal(true);
    expect(messageCalled.foo2).to.equal(false);
    mb.publish('foo3');
    expect(messageCalled.foo2).to.equal(true);
  });

  it('should trigger callback if dependent is ready first', () => {
    mb.subscribe('foo', 'test', callback);
    mb.subscribe('foo1', 'test', callback);
    mb.addDependent('foo', 'foo1', 'test', callback);
    expect(messageCalled.foo).to.equal(false);
    mb.publish('foo1');
    expect(messageCalled.foo).to.equal(false);
    expect(messageCalled.foo1).to.equal(true);
    mb.publish('foo');
    expect(messageCalled.foo).to.equal(true);
  });

  it(`should one event depend on multiple events, it shouldnt be called
      until it no longer depends on anything`, () => {
    mb.subscribe('foo1', 'test', callback);
    mb.subscribe('foo2', 'test', callback);
    mb.subscribe('foo3', 'test', callback);
    mb.addDependent('foo1', 'foo2', 'test');
    mb.addDependent('foo1', 'foo3', 'test');

    expect(messageCalled.foo1).to.equal(false);
    expect(messageCalled.foo2).to.equal(false);
    expect(messageCalled.foo3).to.equal(false);
    mb.publish('foo1');
    expect(messageCalled.foo1).to.equal(false);
    expect(messageCalled.foo2).to.equal(false);
    expect(messageCalled.foo3).to.equal(false);
    mb.publish('foo2');
    expect(messageCalled.foo1).to.equal(false);
    expect(messageCalled.foo2).to.equal(true);
    expect(messageCalled.foo3).to.equal(false);
    mb.publish('foo3');
    expect(messageCalled.foo1).to.equal(true);
    expect(messageCalled.foo2).to.equal(true);
    expect(messageCalled.foo3).to.equal(true);
  });

  it(`should one event depend on multiple events, it shouldnt be called
      if blocked even if it has arguments`, () => {
    mb.subscribe('foo1', 'test', callback);
    mb.subscribe('foo2', 'test', callback);
    mb.subscribe('foo3', 'test', callback);
    mb.addDependent('foo1', 'foo2', 'test');
    mb.addDependent('foo1', 'foo3', 'test');

    expect(messageCalled.foo1).to.equal(false);
    expect(messageCalled.foo2).to.equal(false);
    expect(messageCalled.foo3).to.equal(false);
    mb.publish('foo1', '1');
    expect(messageCalled.foo1).to.equal(false);
    expect(messageCalled.foo2).to.equal(false);
    expect(messageCalled.foo3).to.equal(false);
    mb.publish('foo2', '2');
    expect(messageCalled.foo1).to.equal(false);
    expect(messageCalled.foo2).to.equal(true);
    expect(messageCalled.foo3).to.equal(false);
    mb.publish('foo3', '3');
    expect(messageCalled.foo1).to.equal(true);
    expect(messageCalled.foo2).to.equal(true);
    expect(messageCalled.foo3).to.equal(true);
  });

  it('should one event depend on multiple events, it shouldnt be called even if fully unblocked', () => {
    mb.subscribe('foo1', 'test', callback);
    mb.subscribe('foo2', 'test', callback);
    mb.subscribe('foo3', 'test', callback);
    mb.addDependent('foo1', 'foo2', 'test', callback);
    mb.addDependent('foo1', 'foo3', 'test', callback);

    expect(messageCalled.foo1).to.equal(false);
    expect(messageCalled.foo2).to.equal(false);
    expect(messageCalled.foo3).to.equal(false);
    mb.publish('foo2');
    expect(messageCalled.foo1).to.equal(false);
    expect(messageCalled.foo2).to.equal(true);
    expect(messageCalled.foo3).to.equal(false);
    mb.publish('foo3');
    expect(messageCalled.foo1).to.equal(false);
    expect(messageCalled.foo2).to.equal(true);
    expect(messageCalled.foo3).to.equal(true);
  });

  it('should one event depend on multiple events, it should be called if unblocked', () => {
    mb.subscribe('foo1', 'test', callback);
    mb.subscribe('foo2', 'test', callback);
    mb.subscribe('foo3', 'test', callback);
    mb.addDependent('foo1', 'foo2', 'test', callback);
    mb.addDependent('foo1', 'foo3', 'test', callback);

    expect(messageCalled.foo1).to.equal(false);
    expect(messageCalled.foo2).to.equal(false);
    expect(messageCalled.foo3).to.equal(false);
    mb.publish('foo2');
    expect(messageCalled.foo1).to.equal(false);
    expect(messageCalled.foo2).to.equal(true);
    expect(messageCalled.foo3).to.equal(false);
    mb.publish('foo3');
    expect(messageCalled.foo1).to.equal(false);
    expect(messageCalled.foo2).to.equal(true);
    expect(messageCalled.foo3).to.equal(true);
    mb.publish('foo1');
    expect(messageCalled.foo1).to.equal(true);
    expect(messageCalled.foo2).to.equal(true);
    expect(messageCalled.foo3).to.equal(true);
  });

  it('should multiple events depend on one events, one raised', () => {
    mb.subscribe('foo1', 'test', callback);
    mb.subscribe('foo2', 'test', callback);
    mb.subscribe('foo3', 'test', callback);
    mb.addDependent('foo2', 'foo1', 'test', callback);
    mb.addDependent('foo3', 'foo1', 'test', callback);

    mb.publish('foo3');
    expect(messageCalled.foo2).to.equal(false);
    expect(messageCalled.foo3).to.equal(false);
    mb.publish('foo1');
    expect(messageCalled.foo1).to.equal(true);
    expect(messageCalled.foo2).to.equal(false);
    expect(messageCalled.foo3).to.equal(true);
  });

  it('should multiple events depend on one events, both raised', () => {
    mb.subscribe('foo1', 'test', callback);
    mb.subscribe('foo2', 'test', callback);
    mb.subscribe('foo3', 'test', callback);
    mb.addDependent('foo2', 'foo1', 'test');
    mb.addDependent('foo3', 'foo1', 'test');

    mb.publish('foo2');
    mb.publish('foo3');
    expect(messageCalled.foo2).to.equal(false);
    expect(messageCalled.foo3).to.equal(false);
    mb.publish('foo1');
    expect(messageCalled.foo1).to.equal(true);
    expect(messageCalled.foo2).to.equal(true);
    expect(messageCalled.foo3).to.equal(true);
  });

  it('should many events depend on one events, all raised', () => {
    mb.subscribe('foo', 'test', callback);
    mb.subscribe('foo1', 'test', callback);
    mb.subscribe('foo2', 'test', callback);
    mb.subscribe('foo3', 'test', callback);
    mb.subscribe('foo4', 'test', callback);
    mb.addDependent('foo', 'foo4', 'test');
    mb.addDependent('foo1', 'foo4', 'test');
    mb.addDependent('foo2', 'foo4', 'test');
    mb.addDependent('foo3', 'foo4', 'test');
    expect(messageCalled.foo).to.equal(false);
    expect(messageCalled.foo1).to.equal(false);
    expect(messageCalled.foo2).to.equal(false);
    expect(messageCalled.foo3).to.equal(false);
    expect(messageCalled.foo4).to.equal(false);
    mb.publish('foo');
    mb.publish('foo1');
    mb.publish('foo2');
    mb.publish('foo3');
    expect(messageCalled.foo).to.equal(false);
    expect(messageCalled.foo1).to.equal(false);
    expect(messageCalled.foo2).to.equal(false);
    expect(messageCalled.foo3).to.equal(false);
    expect(messageCalled.foo4).to.equal(false);
    mb.publish('foo4');
    expect(messageCalled.foo).to.equal(true);
    expect(messageCalled.foo1).to.equal(true);
    expect(messageCalled.foo2).to.equal(true);
    expect(messageCalled.foo3).to.equal(true);
    expect(messageCalled.foo4).to.equal(true);
  });

  it('should override params', () => {
    let fooParams = null;
    let foo1Params = null;
    let arg0 = null;
    let arg1 = null;
    mb.subscribe('foo', 'test', (...args) => {
      fooParams = args;
    });
    mb.subscribe('foo1', 'test', (...args) => {
      foo1Params = args;
    });
    const onMerge = function (e0, e1, e0s, e1s) {
      arg0 = e0s;
      arg1 = e1s;
      return ['mynewfoo'];
    };
    mb.addDependent('foo', 'foo1', 'test', onMerge);
    mb.publish('foo', 'v0');
    mb.publish('foo1', 'v1');

    expect(fooParams).to.eql({ 0: 'foo', 1: 'mynewfoo' });
    expect(arg0[0]).to.eql('v0');
    expect(arg1[0]).to.eql('v1');
    expect(foo1Params).to.eql({ 0: 'foo1', 1: 'v1' });
  });

  it('should maintain original params by default', () => {
    let fooParams = null;
    let foo1Params = null;
    let arg0 = null;
    let arg1 = null;
    mb.subscribe('foo', 'test', (...arg) => {
      fooParams = arg;
    });
    mb.subscribe('foo1', 'test', (...arg) => {
      foo1Params = arg;
    });
    const onMerge = function (e0, e1, e0s, e1s) {
      arg0 = e0s;
      arg1 = e1s;
    };
    mb.addDependent('foo', 'foo1', 'test', onMerge);
    mb.publish('foo', 'v0');
    mb.publish('foo1', 'v1');

    expect(arg0[0]).to.eql('v0');
    expect(arg1[0]).to.eql('v1');
    expect(fooParams).to.eql({ 0: 'foo', 1: 'v0' });
    expect(foo1Params).to.eql({ 0: 'foo1', 1: 'v1' });
  });

  it('should maintain original params when givin null', () => {
    let fooParams = null;
    let foo1Params = null;
    let arg0 = null;
    let arg1 = null;
    mb.subscribe('foo', 'test', (...arg) => {
      fooParams = arg;
    });
    mb.subscribe('foo1', 'test', (...arg) => {
      foo1Params = arg;
    });
    const onMerge = function (e0, e1, e0s, e1s) {
      arg0 = e0s;
      arg1 = e1s;
      return null;
    };
    mb.addDependent('foo', 'foo1', 'test', onMerge);
    mb.publish('foo', 'v0');
    mb.publish('foo1', 'v1');

    expect(arg0[0]).to.eql('v0');
    expect(arg1[0]).to.eql('v1');
    expect(fooParams).to.eql({ 0: 'foo', 1: 'v0' });
    expect(foo1Params).to.eql({ 0: 'foo1', 1: 'v1' });
  });

  it('should maintain original params when not giving merge function', () => {
    let fooParams = null;
    let foo1Params = null;
    mb.subscribe('foo', 'test', (...arg) => {
      fooParams = arg;
    });
    mb.subscribe('foo1', 'test', (...arg) => {
      foo1Params = arg;
    });
    mb.addDependent('foo', 'foo1', 'test');
    mb.publish('foo', 'v0');
    mb.publish('foo1', 'v1');
    expect(fooParams).to.eql({ 0: 'foo', 1: 'v0' });
    expect(foo1Params).to.eql({ 0: 'foo1', 1: 'v1' });
  });

  it('should not affect params of subsequent unblocked events', () => {
    let fooParams = null;
    let foo1Params = null;
    mb.subscribe('foo', 'test', (...arg) => {
      fooParams = arg;
    });
    mb.subscribe('foo1', 'test', (...arg) => {
      foo1Params = arg;
    });
    const onMerge = function () {
      return ['mynewfoo'];
    };
    mb.addDependent('foo', 'foo1', 'test', onMerge);
    mb.publish('foo', 'v0', 'v3');
    mb.publish('foo1', 'v1', 'v2');
    expect(fooParams).to.eql({ 0: 'foo', 1: 'mynewfoo' });
    expect(foo1Params).to.eql({ 0: 'foo1', 1: 'v1', 2: 'v2' });
    mb.publish('foo', 'v4', 'v5');
    expect(fooParams).to.eql({ 0: 'foo', 1: 'v4', 2: 'v5' });
  });

  it('should multiple dependent if only one dependent ready,not register rest', () => {
    mb.subscribe('foo', 'test', callback);
    mb.subscribe('foo4', 'test', callback);
    mb.addDependent('foo', 'foo1', 'test');
    mb.addDependent('foo', 'foo2', 'test');
    mb.addDependent('foo1', 'foo3', 'test');
    mb.addDependent('foo3', 'foo4', 'test');
    expect(messageCalled.foo).to.equal(false);
    mb.publish('foo4');
    expect(messageCalled.foo).to.equal(false);
    expect(messageCalled.foo4).to.equal(true);
  });

  it('should multiple dependent', () => {
    mb.subscribe('foo', 'test', callback);
    mb.subscribe('foo4', 'test', callback);
    mb.addDependent('foo', 'foo1', 'test');
    mb.addDependent('foo', 'foo2', 'test');
    mb.addDependent('foo1', 'foo3', 'test');
    mb.addDependent('foo3', 'foo4', 'test');
    mb.publish('foo');
    expect(messageCalled.foo).to.equal(false);

    mb.publish('foo1');
    mb.publish('foo2');
    mb.publish('foo3');
    mb.publish('foo4');
    expect(messageCalled.foo).to.equal(true);
    expect(messageCalled.foo4).to.equal(true);
  });

  it('should multiple dependent params', () => {
    const params = {};
    const listener = function (...args) {
      messageCalled[args[0]] = true;
      params[args[0]] = args;
    };
    mb.subscribe('foo', 'test', listener);
    mb.subscribe('foo1', 'test', listener);
    mb.subscribe('foo2', 'test', listener);
    mb.subscribe('foo3', 'test', listener);
    mb.subscribe('foo4', 'test', listener);
    mb.addDependent('foo', 'foo1', 'test');
    mb.addDependent('foo', 'foo2', 'test');
    mb.addDependent('foo1', 'foo3', 'test');
    mb.addDependent('foo3', 'foo4', 'test');

    mb.publish('foo', 'fooparam');
    expect(messageCalled.foo).to.equal(false);
    mb.publish('foo2', 'fooparam2');
    expect(messageCalled.foo).to.equal(false);
    expect(messageCalled.foo2).to.equal(true);
    expect(params.foo2).to.eql({ 0: 'foo2', 1: 'fooparam2' });
    mb.publish('foo1', 'fooparam1');
    expect(messageCalled.foo).to.equal(false);
    expect(messageCalled.foo1).to.equal(false);
    mb.publish('foo3', 'fooparam3');
    expect(messageCalled.foo3).to.equal(false);
    mb.publish('foo4', 'fooparam4');
    expect(messageCalled.foo4).to.equal(true);
    expect(messageCalled.foo3).to.equal(true);
    expect(messageCalled.foo1).to.equal(true);
    expect(messageCalled.foo).to.equal(true);
    expect(params.foo3).to.eql({ 0: 'foo3', 1: 'fooparam3' });
    expect(params.foo4).to.eql({ 0: 'foo4', 1: 'fooparam4' });
    expect(params.foo).to.eql({ 0: 'foo', 1: 'fooparam' });
  });

  it('should multiple dependent params maintain original params', () => {
    const params = {};
    const listener = function (...args) {
      messageCalled[args[0]] = true;
      params[args[0]] = args;
    };
    mb.subscribe('foo', 'test', listener);
    mb.addDependent('foo', 'foo1', 'test');
    mb.addDependent('foo', 'foo2', 'test');
    mb.addDependent('foo', 'foo3', 'test');
    mb.addDependent('foo', 'foo4', 'test');

    mb.publish('foo', 'fooparam');
    expect(messageCalled.foo).to.equal(false);
    mb.publish('foo1', 'fooparam1');
    expect(messageCalled.foo).to.equal(false);
    mb.publish('foo2', 'fooparam2');
    expect(messageCalled.foo).to.equal(false);
    mb.publish('foo3', 'fooparam3');
    expect(messageCalled.foo).to.equal(false);
    mb.publish('foo4', 'fooparam4');
    expect(messageCalled.foo).to.equal(true);
    expect(params.foo).to.eql({ 0: 'foo', 1: 'fooparam' });
  });

  it('should intercept the event and change arguments', () => {
    let eventName = null;
    let hash = null;
    const subscribeCallback = function (en, h) {
      eventName = en;
      hash = h;
    };
    const interceptCallback = function () {
      return ['wtf'];
    };
    mb.subscribe('foo', 'test', subscribeCallback);
    mb.publish('foo', 'bar');
    expect(eventName).to.equal('foo');
    expect(hash).to.equal('bar');

    mb.intercept('foo', 'test', interceptCallback);
    mb.publish('foo', 'bar');
    expect(eventName).to.equal('foo');
    expect(hash).to.equal('wtf');
  });

  it('should remove dependency before blocked', () => {
    mb.subscribe('foo', 'test', callbackWithParam);
    mb.addDependent('foo', 'foo1', 'test');
    mb.removeDependent('foo', 'foo1');
    mb.publish('foo1', true);
    expect(messageCalled.foo).to.be(false);
    mb.publish('foo', true);
    expect(messageCalled.foo).to.be(true);
  });

  it('should remove dependency after blocked', () => {
    mb.subscribe('foo', 'test', callbackWithParam);
    mb.subscribe('foo1', 'test', callbackWithParam);
    mb.addDependent('foo', 'foo1', 'test');
    mb.publish('foo', { foo: 'hello' });
    expect(messageCalled.foo).to.be(false);
    expect(messageCalled.foo1).to.be(false);
    mb.removeDependent('foo', 'foo1');
    mb.publish('foo1', { foo1: 'hello1' });
    expect(messageCalled.foo).to.eql({ foo: 'hello' });
    expect(messageCalled.foo1).to.eql({ foo1: 'hello1' });
  });

  it('should call all subscribers on exception', () => {
    let test1 = false;
    let test2 = false;
    const excepts1 = function () {
      test1 = true;
      throw '';
    };
    const excepts2 = function () {
      test2 = true;
      throw '';
    };
    mb.subscribe('foo', 'test1', excepts1);
    mb.subscribe('foo', 'test2', excepts2);
    mb.subscribe('foo1', 'test', callback);
    expect(test1).to.be(false);
    expect(test2).to.be(false);
    mb.publish('foo');
    expect(test1).to.be(true);
    expect(test2).to.be(true);
    expect(messageCalled.foo1).to.equal(false);
    mb.publish('foo1');
    expect(messageCalled.foo1).to.equal(true);
  });

  it('should call all subscribers on exception with params', () => {
    let test1 = false;
    let test2 = false;
    const excepts1 = function (...args) {
      test1 = true;
      callbackWithParam.apply(this, args);
      throw '';
    };
    const excepts2 = function (...args) {
      test2 = true;
      callbackWithParam.apply(this, args);
      throw '';
    };
    mb.subscribe('foo', 'test1', excepts1);
    mb.subscribe('foo', 'test2', excepts2);
    mb.subscribe('foo1', 'test', callbackWithParam);
    expect(test1).to.be(false);
    expect(test2).to.be(false);
    mb.publish('foo', 'fooparam');
    expect(test1).to.be(true);
    expect(test2).to.be(true);
    expect(messageCalled.foo1).to.equal(false);
    mb.publish('foo1', 'fooparam1');
    expect(messageCalled.foo).to.equal('fooparam');
    expect(messageCalled.foo1).to.equal('fooparam1');
  });

  it('should call all subscribers on exception in dependent', () => {
    let test0 = false;
    const excepts0 = function () {
      test0 = true;
      throw '';
    };
    mb.subscribe('foo', 'test', excepts0);
    mb.subscribe('foo1', 'test', callback);
    mb.addDependent('foo1', 'foo');
    expect(test0).to.be(false);
    expect(messageCalled.foo1).to.equal(false);
    mb.publish('foo1');
    mb.publish('foo');
    expect(test0).to.be(true);
    expect(messageCalled.foo1).to.equal(true);
  });

  it('should call all subscribers on exception in dependent with params', () => {
    let test0 = false;
    const excepts0 = function () {
      test0 = true;
      throw '';
    };
    mb.subscribe('foo', 'test', excepts0);
    mb.subscribe('foo1', 'test', callbackWithParam);
    mb.addDependent('foo1', 'foo');
    expect(test0).to.be(false);
    expect(messageCalled.foo1).to.equal(false);
    mb.publish('foo1', 'fooparam1');
    mb.publish('foo', 'fooparam');
    expect(test0).to.be(true);
    expect(messageCalled.foo1).to.equal('fooparam1');
  });

  it('should call all subscribers on null pointer exception', () => {
    let test1 = false;
    let test2 = false;
    const excepts1 = function () {
      test1 = true;
    };
    const excepts2 = function () {
      test2 = true;
    };
    mb.subscribe('foo', 'test1', excepts1);
    mb.subscribe('foo', 'test2', excepts2);
    mb.subscribe('foo1', 'test', callback);
    expect(test1).to.be(false);
    expect(test2).to.be(false);
    mb.publish('foo');
    expect(test1).to.be(true);
    expect(test2).to.be(true);
    expect(messageCalled.foo1).to.equal(false);
    mb.publish('foo1');
    expect(messageCalled.foo1).to.equal(true);
  });

  it('should call all subscribers on null pointer exception in dependent', () => {
    let test0 = false;
    const excepts0 = function () {
      test0 = true;
    };
    mb.subscribe('foo', 'test', excepts0);
    mb.subscribe('foo1', 'test', callback);
    mb.addDependent('foo1', 'foo');
    expect(test0).to.be(false);
    expect(messageCalled.foo1).to.equal(false);
    mb.publish('foo1');
    mb.publish('foo');
    expect(test0).to.be(true);
    expect(messageCalled.foo1).to.equal(true);
  });

  it('should support chaining of dependents', () => {
    mb.subscribe('foo', 'test', callback);
    mb.subscribe('foo1', 'test', callback);
    mb.subscribe('foo2', 'test', callback);
    mb.addDependent('foo1', 'foo', 'test');
    mb.addDependent('foo2', 'foo1', 'test');
    expect(messageCalled.foo).to.equal(false);
    expect(messageCalled.foo1).to.equal(false);
    expect(messageCalled.foo2).to.equal(false);
    mb.publish('foo1');
    mb.publish('foo2');
    expect(messageCalled.foo).to.equal(false);
    expect(messageCalled.foo1).to.equal(false);
    expect(messageCalled.foo2).to.equal(false);
    mb.publish('foo');
    expect(messageCalled.foo).to.equal(true);
    expect(messageCalled.foo1).to.equal(true);
    expect(messageCalled.foo2).to.equal(true);
  });

  it('should support chaining of dependents with params', () => {
    mb.subscribe('foo', 'test', callbackWithParam);
    mb.subscribe('foo1', 'test', callbackWithParam);
    mb.subscribe('foo2', 'test', callbackWithParam);
    mb.addDependent('foo1', 'foo', 'test');
    mb.addDependent('foo2', 'foo1', 'test');
    expect(messageCalled.foo).to.equal(false);
    expect(messageCalled.foo1).to.equal(false);
    expect(messageCalled.foo2).to.equal(false);
    mb.publish('foo1', 1);
    mb.publish('foo2', 2);
    expect(messageCalled.foo).to.equal(false);
    expect(messageCalled.foo1).to.equal(false);
    expect(messageCalled.foo2).to.equal(false);
    mb.publish('foo', 0);
    expect(messageCalled.foo).to.equal(0);
    expect(messageCalled.foo1).to.equal(1);
    expect(messageCalled.foo2).to.equal(2);
  });

  it('should support chaining of dependents when called in a different order', () => {
    mb.subscribe('foo', 'test', callback);
    mb.subscribe('foo1', 'test', callback);
    mb.subscribe('foo2', 'test', callback);
    mb.addDependent('foo1', 'foo', 'test');
    mb.addDependent('foo2', 'foo1', 'test');
    expect(messageCalled.foo).to.equal(false);
    expect(messageCalled.foo1).to.equal(false);
    expect(messageCalled.foo2).to.equal(false);
    mb.publish('foo2');
    mb.publish('foo1');
    expect(messageCalled.foo).to.equal(false);
    expect(messageCalled.foo1).to.equal(false);
    expect(messageCalled.foo2).to.equal(false);
    mb.publish('foo');
    expect(messageCalled.foo).to.equal(true);
    expect(messageCalled.foo1).to.equal(true);
    expect(messageCalled.foo2).to.equal(true);
  });

  it('should call dependents after they are unblocked from a chain', () => {
    mb.subscribe('foo', 'test', callback);
    mb.subscribe('foo1', 'test', callback);
    mb.subscribe('foo2', 'test', callback);
    mb.addDependent('foo1', 'foo', 'test');
    mb.addDependent('foo2', 'foo1', 'test');
    expect(messageCalled.foo).to.equal(false);
    expect(messageCalled.foo1).to.equal(false);
    expect(messageCalled.foo2).to.equal(false);
    mb.publish('foo');
    expect(messageCalled.foo).to.equal(true);
    expect(messageCalled.foo1).to.equal(false);
    expect(messageCalled.foo2).to.equal(false);
    mb.publish('foo1');
    expect(messageCalled.foo).to.equal(true);
    expect(messageCalled.foo1).to.equal(true);
    expect(messageCalled.foo2).to.equal(false);
    mb.publish('foo2');
    expect(messageCalled.foo).to.equal(true);
    expect(messageCalled.foo1).to.equal(true);
    expect(messageCalled.foo2).to.equal(true);
  });

  it('should still block even if chain member is unblocked', () => {
    mb.subscribe('foo', 'test', callback);
    mb.subscribe('foo1', 'test', callback);
    mb.subscribe('foo2', 'test', callback);
    mb.addDependent('foo1', 'foo', 'test');
    mb.addDependent('foo2', 'foo1', 'test');
    expect(messageCalled.foo).to.equal(false);
    expect(messageCalled.foo1).to.equal(false);
    expect(messageCalled.foo2).to.equal(false);
    mb.publish('foo');
    expect(messageCalled.foo).to.equal(true);
    expect(messageCalled.foo1).to.equal(false);
    expect(messageCalled.foo2).to.equal(false);
    mb.publish('foo2');
    expect(messageCalled.foo).to.equal(true);
    expect(messageCalled.foo1).to.equal(false);
    expect(messageCalled.foo2).to.equal(false);
    mb.publish('foo1');
    expect(messageCalled.foo).to.equal(true);
    expect(messageCalled.foo1).to.equal(true);
    expect(messageCalled.foo2).to.equal(true);
  });

  it('should release block from one part of chain without calling other part', () => {
    mb.subscribe('foo', 'test', callback);
    mb.subscribe('foo1', 'test', callback);
    mb.subscribe('foo2', 'test', callback);
    mb.addDependent('foo1', 'foo', 'test');
    mb.addDependent('foo2', 'foo1', 'test');
    expect(messageCalled.foo).to.equal(false);
    expect(messageCalled.foo1).to.equal(false);
    expect(messageCalled.foo2).to.equal(false);
    mb.publish('foo1');
    expect(messageCalled.foo).to.equal(false);
    expect(messageCalled.foo1).to.equal(false);
    expect(messageCalled.foo2).to.equal(false);
    mb.publish('foo');
    expect(messageCalled.foo).to.equal(true);
    expect(messageCalled.foo1).to.equal(true);
    expect(messageCalled.foo2).to.equal(false);
    mb.publish('foo2');
    expect(messageCalled.foo).to.equal(true);
    expect(messageCalled.foo1).to.equal(true);
    expect(messageCalled.foo2).to.equal(true);
  });

  it('should protect against subscribing/publishing events with no event name', () => {
    let called = false;
    const myCallback = function () {
      called = true;
    };
    mb.subscribe('', 'test', myCallback);
    mb.subscribe(null, 'test', myCallback);
    mb.subscribe();
    mb.subscribe('foo', 'test', callback);
    mb.subscribe('foo1', 'test', callback);
    expect(messageCalled.foo).to.equal(false);
    expect(messageCalled.foo1).to.equal(false);
    expect(called).to.equal(false);
    mb.publish('');
    mb.publish(null);
    mb.publish();
    expect(messageCalled.foo).to.equal(false);
    expect(messageCalled.foo1).to.equal(false);
    expect(called).to.equal(false);
    mb.publish('foo');
    expect(messageCalled.foo).to.equal(true);
    expect(messageCalled.foo1).to.equal(false);
    expect(called).to.equal(false);
    mb.publish('');
    mb.publish(null);
    mb.publish();
    expect(messageCalled.foo).to.equal(true);
    expect(messageCalled.foo1).to.equal(false);
    expect(called).to.equal(false);
    mb.publish('foo1');
    expect(messageCalled.foo).to.equal(true);
    expect(messageCalled.foo1).to.equal(true);
    expect(called).to.equal(false);
  });

  it('should protect against subscribing/publishing events with no event name with publish params', () => {
    let called = false;
    const myCallback = function () {
      called = true;
    };
    mb.subscribe('', 'test', myCallback);
    mb.subscribe(null, 'test', myCallback);
    mb.subscribe();
    mb.subscribe('foo', 'test', callbackWithParam);
    mb.subscribe('foo1', 'test', callbackWithParam);
    expect(messageCalled.foo).to.equal(false);
    expect(messageCalled.foo1).to.equal(false);
    expect(called).to.equal(false);
    mb.publish('', 'bar1');
    mb.publish(null, 'bar2');
    mb.publish();
    expect(messageCalled.foo).to.equal(false);
    expect(messageCalled.foo1).to.equal(false);
    expect(called).to.equal(false);
    mb.publish('foo', 'param0');
    expect(messageCalled.foo).to.equal('param0');
    expect(messageCalled.foo1).to.equal(false);
    expect(called).to.equal(false);
    mb.publish('', 'baz1');
    mb.publish(null, 'baz2');
    mb.publish();
    expect(messageCalled.foo).to.equal('param0');
    expect(messageCalled.foo1).to.equal(false);
    expect(called).to.equal(false);
    mb.publish('foo1', 'param1');
    expect(messageCalled.foo).to.equal('param0');
    expect(messageCalled.foo1).to.equal('param1');
    expect(called).to.equal(false);
  });

  it('should protect against adding dependents with no event name', () => {
    mb.subscribe('foo', 'test', callback);
    mb.subscribe('foo1', 'test', callback);
    mb.addDependent('', 'foo', 'test');
    mb.addDependent(null, 'foo', 'test');
    mb.addDependent('foo', '', 'test');
    mb.addDependent('foo', null, 'test');
    mb.addDependent('foo');
    expect(messageCalled.foo).to.equal(false);
    expect(messageCalled.foo1).to.equal(false);
    mb.publish('foo');
    expect(messageCalled.foo).to.equal(true);
    expect(messageCalled.foo1).to.equal(false);
    mb.addDependent('foo1', 'foo', 'test');
    mb.publish('foo1');
    expect(messageCalled.foo).to.equal(true);
    expect(messageCalled.foo1).to.equal(false);
    mb.publish('foo');
    expect(messageCalled.foo).to.equal(true);
    expect(messageCalled.foo1).to.equal(true);
  });

  it('should protect against adding dependents with no event name with publish params', () => {
    mb.subscribe('foo', 'test', callbackWithParam);
    mb.subscribe('foo1', 'test', callbackWithParam);
    mb.addDependent('', 'foo', 'test');
    mb.addDependent(null, 'foo', 'test');
    mb.addDependent('foo', '', 'test');
    mb.addDependent('foo', null, 'test');
    mb.addDependent('foo');
    expect(messageCalled.foo).to.equal(false);
    expect(messageCalled.foo1).to.equal(false);
    mb.publish('foo', 'param0');
    expect(messageCalled.foo).to.equal('param0');
    expect(messageCalled.foo1).to.equal(false);
    mb.addDependent('foo1', 'foo', 'test');
    mb.publish('foo1', 'param1');
    expect(messageCalled.foo).to.equal('param0');
    expect(messageCalled.foo1).to.equal(false);
    mb.publish('foo', 'newParam0');
    expect(messageCalled.foo).to.equal('newParam0');
    expect(messageCalled.foo1).to.equal('param1');
  });

  it('should protect against removing dependents with no event name', () => {
    mb.subscribe('foo', 'test', callback);
    mb.subscribe('foo1', 'test', callback);
    mb.addDependent('foo', 'foo1', 'test');
    expect(messageCalled.foo).to.equal(false);
    expect(messageCalled.foo1).to.equal(false);
    mb.removeDependent('foo1', '');
    mb.removeDependent('foo1', null);
    mb.removeDependent('foo1');
    mb.removeDependent();
    mb.removeDependent('');
    mb.removeDependent('foo');
    mb.publish('foo');
    expect(messageCalled.foo).to.equal(false);
    expect(messageCalled.foo1).to.equal(false);
    mb.publish('foo1');
    expect(messageCalled.foo).to.equal(true);
    expect(messageCalled.foo1).to.equal(true);
  });

  it('should protect against unsubscribing with no event name', () => {
    mb.subscribe('foo', 'test', callback);
    expect(messageCalled.foo).to.equal(false);
    mb.unsubscribe('', 'test', callback);
    mb.unsubscribe(null, 'test', callback);
    mb.unsubscribe();
    mb.unsubscribe('foo', 'test', callback);
    mb.publish('foo');
    expect(messageCalled.foo).to.equal(false);
  });

  it('should protect against unsubscribing with no event name with publish params', () => {
    mb.subscribe('foo', 'test', callbackWithParam);
    expect(messageCalled.foo).to.equal(false);
    mb.unsubscribe('', 'test', callbackWithParam);
    mb.unsubscribe(null, 'test', callbackWithParam);
    mb.unsubscribe();
    mb.unsubscribe('foo', 'test', callbackWithParam);
    mb.publish('foo', 'param0');
    expect(messageCalled.foo).to.equal(false);
  });

  it('should keep params of later calls to event if event was previously blocked', () => {
    mb.subscribe('foo', 'test', callbackWithParam);
    mb.subscribe('foo1', 'test', callbackWithParam);
    mb.addDependent('foo', 'foo1', 'test');
    expect(messageCalled.foo).to.equal(false);
    expect(messageCalled.foo1).to.equal(false);
    mb.publish('foo', 'param0');
    expect(messageCalled.foo).to.equal(false);
    expect(messageCalled.foo1).to.equal(false);
    mb.publish('foo1', 'param1');
    expect(messageCalled.foo).to.equal('param0');
    expect(messageCalled.foo1).to.equal('param1');
    mb.publish('foo', 'newParam0');
    expect(messageCalled.foo).to.equal('newParam0');
    mb.publish('foo', 'random');
    expect(messageCalled.foo).to.equal('random');
  });

  it('should maintain published params even if they are undefined', () => {
    const obj = {
      var0: false,
      var1: false,
      var2: false,
    };
    const myCallback = function (eventName, param0, param1, param2) {
      obj.var0 = param0;
      obj.var1 = param1;
      obj.var2 = param2;
    };
    mb.subscribe('foo', 'test', myCallback);
    mb.publish('foo', 'arg0', 'arg1', 'arg2');
    expect(obj.var0).to.equal('arg0');
    expect(obj.var1).to.equal('arg1');
    expect(obj.var2).to.equal('arg2');
    mb.publish('foo', undefined, 'newArg1', 'newArg2');
    expect(obj.var0).to.equal(undefined);
    expect(obj.var1).to.equal('newArg1');
    expect(obj.var2).to.equal('newArg2');
    mb.publish('foo', true, null, true);
    expect(obj.var0).to.equal(true);
    expect(obj.var1).to.equal(null);
    expect(obj.var2).to.equal(true);
  });
});
