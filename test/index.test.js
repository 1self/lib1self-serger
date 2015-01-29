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

  it('loads a stream', function () {
    var config = {
      server: 'http://example.com'
    }
    , stream = lib1self.loadStream(config, 'sid', 'wt', 'rt');
        expect(stream.apiServer).to.equal('http://example.com');
        expect(stream.streamId).to.equal('sid');
        expect(stream.writeToken).to.equal('wt');
        expect(stream.readToken).to.equal('rt');
  })

  it('sends an event', function (done) {
    var config = {
      server: 'http://example.com'
    }
    nock('http://example.com'
      , { reqheaders: {
                    'Authorization': 'wt'
                    , 'Content-Type': 'application/json'
                  } })
                  .post('/v1/streams/12345678/events')
                  .reply(200
                   , {
                      streamid: '12345678'
                      , writeToken: 'wt'
                      , readToken: 'rt'
                    }
                   );
    var stream = lib1self.loadStream(config, '12345678', 'wt', 'rt')
    , event = {
      objectTags: [ 'otest' ]
      , actionTags: [ 'atest' ]
      , properties:{
        value: 1
      }
    };

    stream.send(event, function(error, stream) {
      expect(error).to.equal(null);
      expect(stream.streamid === '12345678');
      done();
    })
  })

  it('processes a 404 as stream not found', function (done) {
    var config = {
      server: 'http://example.com'
    }
    nock('http://example.com'
      , { reqheaders: {
                    'Authorization': 'wt'
                    , 'Content-Type': 'application/json'
                  } })
                  .post('/v1/streams/12345678/events')
                  .reply(404
                   , 'stream not found'
                   );
    var stream = lib1self.loadStream(config, '12345678', 'wt', 'rt')
    , event = {
      objectTags: [ 'otest' ]
      , actionTags: [ 'atest' ]
      , properties:{
        value: 1
      }
    };

    stream.send(event, function(error) {
      console.log(stream.sendCodes.STREAM_NOT_FOUND);
      expect(error).to.equal(stream.sendCodes.STREAM_NOT_FOUND);
      done();
    })
  })

  it('syncs to a callback url', function (done) {
    var config = {
      server: 'http://example.com'
    }
    nock('http://example.com'
      , { reqheaders: {
                    'Authorization': 'wt'
                  } })
                  .post('/sync?username=fred&lastSyncDate=2014-01-01T12:00&streamid=12345678')
                  .reply(200
                   , {}
                   );
    /*jslint maxlen: 250 */
    var stream = lib1self.loadStream(config, '12345678', 'wt', 'rt', 'http://example.com/sync?username=fred&lastSyncDate={{lastSyncDate}}&streamid={{streamid}}', '2014-01-01T12:00');
    /*jslint maxlen: 130 */

    stream.sync(function(error) {
      expect(error).to.equal(null);
      done();
    })
  })

  it('returns a 401 as an auth error', function (done) {
    var config = {
    appId: 'appid'
    , appSecret: 'appsecret'
    , callbackUrl: 'callback'
  };

    nock('http://sandbox.1self.co')
                  .post('/v1/streams')
                  .reply(401
                   , {
                      streamid: '12345678'
                      , writeToken: 'wt'
                      , readToken: 'rt'
                    }
                   );

    var success = function (error) {
      expect(error).to.match(/auth error/);
      done();
    }

    lib1self.createStream(config, success)
  })
})
