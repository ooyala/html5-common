require(`${COMMON_SRC_ROOT}classes/emitter.js`);

describe('emitter', () => {
  let emitter;
  let called;
  let args;
  let callback;

  before(() => {
  });

  after(() => {
  });

  beforeEach(() => {
    emitter = new OO.Emitter();
    called = false;
    args = null;
    callback = function (...params) { called = true; args = params; };
  });

  afterEach(() => {
  });

  it('should trigger callback', () => {
    emitter.on('foo', 'test', callback);
    expect(called).to.be(false);
    emitter.trigger('foo');
    expect(called).to.be(true);
  });

  it('should trigger callback on *', () => {
    emitter.on('*', 'test', callback);
    expect(called).to.be(false);
    emitter.trigger('foo');
    expect(called).to.be(true);
  });

  it('should trigger pass through param', () => {
    emitter.on('foo', 'test', callback);
    emitter.trigger('foo', { foo: 3 });
    expect(args).to.eql({ 0: 'foo', 1: { foo: 3 } });
  });

  it('should not trigger callback if unregistered', () => {
    emitter.on('foo', 'test', callback);
    expect(called).to.be(false);
    emitter.off('foo', 'test', callback);
    emitter.trigger('foo');
    expect(called).to.be(false);
  });

  it('should handle uncaught exceptions in the callback', () => {
    emitter.on('foo', 'test', () => { called = true; throw new Error('test exception not a problem'); });
    expect(called).to.be(false);
    emitter.trigger('foo');
    expect(called).to.be(true);
  });
});
