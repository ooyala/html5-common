require(COMMON_SRC_ROOT + "utils/utils.js");

describe('utils', function(){

  before(function(){
  });

  after(function(){
  });

  describe('inherit', function(){
    var p;
    before(function(){
      p = function() { this.name = 'parent'; this.list = []; };
      OO._.extend(p.prototype, {
         foo: function() {
           this.list.push(1);
           return 'fromParent';
         }
      });
    });

    it('should inherit', function(){
      var c = OO.inherit(p, function() { this.name = 'child'; });
      OO._.extend(c.prototype, {
         foo: function() { return 'fromChild'; }
      });
      var v = new c();
      expect(v.name).to.equal("child");
      expect(v.foo).to.be.a('function');
      expect(v.foo()).to.equal("fromChild");
      expect(v.parentClass.foo()).to.equal("fromParent");
    });

    it('should inherit for two child', function(){
      var c = OO.inherit(p, function() {  });
      var v = new c();
      v.foo();
      var v1 = new c();
      expect(v.name).to.equal("parent");
      expect(v1.name).to.equal("parent");

      expect(v.list).to.eql([1]);
      expect(v1.list).to.eql([]);

    });

  });

  describe('safe clone', function(){
    it('should handle array', function(){
      var a = [1, 2];
      var aClone = OO.safeClone(a);
      expect(a).not.to.equal(aClone);
      expect(aClone).to.have.length(2);
      expect(aClone).to.contain(1);
      expect(aClone).to.contain(2);
    });

    it('should handle object', function(){
      var a = {foo: 1};
      var aClone = OO.safeClone(a);
      expect(a).not.to.equal(aClone);
      expect(a.foo).to.eql(aClone.foo);
    });

    it('should handle object with same values correctly', function(){
      var embeddedObject = {v:1};
      var a = {foo: 1, obj1: embeddedObject, obj2: embeddedObject, v1 : 1, v2: 1};
      var aClone = OO.safeClone(a);
      //console.log(aClone);
      expect(a).not.to.equal(aClone);
      expect(a.foo).to.eql(aClone.foo);
      expect(a.obj1).to.eql(aClone.obj1);
      expect(a.obj2).to.eql(aClone.obj2);
      expect(a.v1).to.eql(aClone.v1);
      expect(a.v2).to.eql(aClone.v2);
      expect(aClone.v1).to.eql(aClone.v2);
    });

    it('should handle primitive type', function(){
      var a = 1;
      var aClone = OO.safeClone(a);
      expect(a.foo).to.eql(aClone.foo);
    });

    it('should handle nested object', function(){
      var a = {a:2, b: { foo: 3}};
      var aClone = OO.safeClone(a);
      expect(a).not.to.equal(aClone);
      expect(a.a).to.eql(aClone.a);
      expect(a.b.foo).to.eql(aClone.b.foo);
    });

    it('should handle circular inclusion', function(){
      var a = {a:2}; a.b = a;
      var aClone = OO.safeClone(a);
      expect(a).not.to.equal(aClone);
      expect(a.a).to.eql(aClone.a);
    });

    it('should handle function', function(){
      var f = function() {};
      var a = {a:f };
      var aClone = OO.safeClone(a);
      expect(a).not.to.equal(aClone);
      expect(aClone).to.eql({a:f});
    });

    it('should handle objects with arrays of objects', function(){
      var a = {streams: [ {url : {type:'yy'}, name: 'xx' } ]};
      var aClone = OO.safeClone(a);
      expect(a).not.to.equal(aClone);
      expect(a.streams).to.eql(aClone.streams);
    });

    it('should handle SAS response properly', function(){
      var a = {"debug_data":{"server_latency":"5.994","request_id":"ip-10-112-191-8_1337038754_5","user_info":{"device":"html5","ip_address":"204.124.203.201","timezone":-7.0,"continent":"NORTH AMERICA","request_timestamp":"1337038754","country":"US","language":"en-us","domain":"mtv-eng-154.mtv"}},"signature":"dvUyhch5QcXxzF3c9he8Q7CZmL/0FafQ5e7HKBkAmlc=\n","authorization_data":{"45cmZqNDrKn7TvtpfGa9k9fQSeyK4VaI":{"code":"0","message":"authorized","request_timestamp":"1337038754","retry":null,"streams":[{"url":{"data":"aHR0cDovL3BsYXllci5vb3lhbGEuY29tL3BsYXllci9pcGhvbmUvNDVjbVpx\nTkRyS243VHZ0cGZHYTlrOWZRU2V5SzRWYUkubTN1OA==","format":"encoded"},"delivery_type":"hls"}],"authorized":true}}};
      //console.log(a.authorization_data['45cmZqNDrKn7TvtpfGa9k9fQSeyK4VaI'].streams)
      var aClone = OO.safeClone(a);
      //console.log(aClone.authorization_data['45cmZqNDrKn7TvtpfGa9k9fQSeyK4VaI'].streams)
      expect(a).not.to.equal(aClone);
      expect(aClone).to.eql(a);
    });

    it('should attachStyle', function(){
      OO.attachStyle("foo {width:0}");
      expect($("style").html()).to.be('foo {width:0}');
      OO.removeStyles();
      expect(!$("style").html()).to.be(true);
    });

    it('should formatSeconds', function(){
      expect(OO.formatSeconds(5)).to.be('00:05');
      expect(OO.formatSeconds(65)).to.be('01:05');
      expect(OO.formatSeconds(3685)).to.be('01:01:25');
    });

    it('should leftPadding', function(){
      expect(OO.leftPadding(1, 5)).to.be('00001');
      expect(OO.leftPadding(2, 0)).to.be('2');
      expect(OO.leftPadding(3, 1)).to.be('3');
    });

    it('should getColorString', function(){
      expect(OO.getColorString(0x333)).to.be('#000333');
      expect(OO.getColorString(0xa1b2c3)).to.be('#A1B2C3');
    });

    it('should hexToRgb', function(){
      expect(OO.hexToRgb(0x333)).to.eql([0, 3, 51]);
      expect(OO.hexToRgb(0xa1b2c3)).to.eql([161, 178, 195 ]);
    });

    it('should changeColor', function(){
      expect(OO.changeColor(0xf0f0f0, 0.1, true)).to.be('d6d6d6');
      expect(OO.changeColor(0xf0f0f0, 0.01, false)).to.be('f3f3f3');
    });

    it('should decode64', function(){
      expect(OO.decode64('aGVsbG8gd29ybGQ=')).to.be('hello world');
    });

    it('should regexEscape', function(){
      expect(OO.regexEscape('<foo>(foo1)[foo2]')).to.be('\\<foo\\>\\(foo1\\)\\[foo2\\]');
    });

    it('should getNormalizedTagUrl', function(){
      Date.prototype.getTime = function() { return 123; };
      expect(OO.getNormalizedTagUrl('http://foo?<now>&[LR_URL]')).to.be('http://foo?123&' + escape(document.URL));
    });

    it('should safeSeekRange', function(){
      var seekRange = { length: 1, start: function() { return 2 }, end: function() { return 5 }};
      expect(OO.safeSeekRange(seekRange)).to.eql({start:2, end: 5});
    });

    it('should loadScriptOnce', function(){
      $.ajax = function() {};
      var firstLoad = OO.loadScriptOnce("foo.js");
      var secondLoad = OO.loadScriptOnce("foo.js");
      expect(firstLoad).to.be(true);
      expect(secondLoad).to.be(false);
    });

  });
});
