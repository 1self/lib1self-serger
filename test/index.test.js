var Lib1self = require('../').Lib1self
, chai = require('chai')
, expect = chai.expect
, nock = require('nock');

describe('lib1self', function () {

  // it('should work as expected', function (done) {
  // 	var lib1self = new Lib1self()
  // 	,success = function() {
  // 		console.log('success');
  // 		done();
  // 	}
  // 	,failure = function(e) {
  // 		throw 'test failed:'  + e;

  // 	};

  // 	lib1self.createStream(success, failure);
  // })

  /*jshint -W031 */
  it('checks that config has been passed', function () {
  	expect(Lib1self).to.throw(/config object must be defined/);
  })

  it('checks that appId is set', function () {
  	var appIdNotSet = function () {
  		new Lib1self({});
  	}
  	expect(appIdNotSet).to.throw(/appId/);
  })

  it('checks that appSecret is set', function () {
	var config = {
		appId: ''
	}
	,constructorCall = function () {
  		new Lib1self(config);
  	}
  	expect(constructorCall).to.throw(/appSecret/);
  })

  it('constructs lib1self', function () {
		var config = {
		appId: ''
		, appSecret: ''
	}
	,constructorCall = function () {
  		new Lib1self(config);
  	};

  	expect(constructorCall);
  })

  it('constructs lib1self', function (done) {
	var config = {
		appId: ''
		, appSecret: ''
	};

  	nock('http://sandbox.1self.co')
	                .post('/v1/streams')
	                .reply(200
	            	   , {
	              			streamId: '12345678'
	              			, writeToken: 'wt'
	              			, readToken: 'rt'
	              		}
	                 );

    var lib1self = new Lib1self(config)
    , success = function (stream) {
    	console.log(stream);
    	done();
    }

    lib1self.createStream(success, function () {})
  })

})
