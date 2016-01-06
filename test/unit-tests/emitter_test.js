require(COMMON_SRC_ROOT + "classes/emitter.js");

describe('emitter', function(){
  var emitter;
  var called;
  var args;
  var callback;

  before(function(){
  });

  after(function(){
  });

  beforeEach(function(){
    emitter = new OO.Emitter();
    called = false;
    args = null;
    callback = function() { called = true; args = arguments;}
  });

  afterEach(function(){
  });

  it('should trigger callback', function(){
    emitter.on("foo", 'test', callback);
    expect(called).to.be(false);
    emitter.trigger("foo");
    expect(called).to.be(true);
  });

  it('should trigger callback on *', function(){
    emitter.on("*", 'test', callback);
    expect(called).to.be(false);
    emitter.trigger("foo");
    expect(called).to.be(true);
  });

  it('should trigger pass through param', function(){
    emitter.on("foo", 'test', callback);
    emitter.trigger("foo", { foo: 3});
    expect(args).to.eql({ '0': 'foo', '1': { foo: 3 } });
  });

  it('should not trigger callback if unregistered', function(){
    emitter.on("foo", 'test', callback);
    expect(called).to.be(false);
    emitter.off("foo", 'test', callback);
    emitter.trigger("foo");
    expect(called).to.be(false);
  });

  it('should handle uncaught exceptions in the callback', function(){
    emitter.on("foo", 'test', function() { called = true; throw new Error("test exception not a problem"); } );
    expect(called).to.be(false);
    emitter.trigger("foo");
    expect(called).to.be(true);
  });


});
