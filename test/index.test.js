var lib1self = require('../')
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
  it('createStream checks that config has been passed', function () {
    var createStreamCall = function() {
      lib1self.createStream();
    };
  	expect(createStreamCall).to.throw(/config object must be defined/);
  })

  it('createStream checks that appId is set', function () {
  	var appIdNotSet = function () {
  		lib1self.createStream({});
  	}
  	expect(appIdNotSet).to.throw(/appId/);
  })

  it('createStream checks that appSecret is set', function () {
	var config = {
		appId: ''
	}
	,constructorCall = function () {
  		lib1self.createStream(config);
  	}
  	expect(constructorCall).to.throw(/appSecret/);
  })

  it('createStream checks that callbackUrl is set', function () {
  var config = {
    appId: ''
    , appSecret: ''
  }
  ,constructorCall = function () {
      lib1self.createStream(config);
    }
    expect(constructorCall).to.throw(/callbackUrl/);
  })

  it('createStream call posts on api', function (done) {
	var config = {
		appId: 'appid'
		, appSecret: 'appsecret'
    , callbackUrl: 'callback'
	};

  	nock('http://sandbox.1self.co')
	                .post('/v1/streams')
	                .reply(200
	            	   , {
	              			streamid: '12345678'
	              			, writeToken: 'wt'
	              			, readToken: 'rt'
	              		}
	                 );

    var success = function () {
    	done();
    }

    lib1self.createStream(config, success)
  })

  it('visualize creates a barcahrt url', function (done) {
  var config = {
    appId: 'appid'
    , appSecret: 'appsecret'
    , callbackUrl: 'callback'
    , server: 'http://example.com'
  };

    nock('http://example.com')
                  .post('/v1/streams')
                  .reply(200
                   , {
                      streamid: '12345678'
                      , writeToken: 'wt'
                      , readToken: 'rt'
                      , callbackUrl: 'callback'
                    }
                   );
    lib1self.createStream(config, function (error, stream) {

      /*jslint maxlen: 180 */
      var expectedUrl = 'http://example.com/v1/streams/12345678/events/otag1,otag2/atag1,atag2/count/daily/barchart?readToken=rt&bgColor=000000'
      /*jslint maxlen: 130 */
      , barchartUrl = stream.visualize()
                              .objectTags([ 'otag1', 'otag2' ])
                              .actionTags([ 'atag1', 'atag2' ])
                              .count()
                              .barChart()
                              .background('000000')
                              .url();
      expect(barchartUrl).
      to.equal(expectedUrl);
      done();
    })
  })

})
