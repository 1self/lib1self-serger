var request = require('request');

exports.sandbox = 'http://sandbox.1self.co';
exports.production = 'https://api.1self.co';

function Visualization(apiEndpoint, streamId, writeToken, readToken){
	var self = this;

	self.apiEndpoint = apiEndpoint;
	self.streamId = streamId;
	self.writeToken = writeToken;
	self.readToken = readToken;

    this.objectTags = function (tags) {
        self.OBJECT_TAGS = tags;
        return self;
    };

    this.actionTags = function (tags) {
        self.ACTION_TAGS = tags;
        return self;
    };

    this.sum = function (property) {
        self.FUNCTION_TYPE = 'sum(' + property + ')';
        self.SELECTED_PROP = property;
        return self;
    };

    this.mean = function (property) {
        self.FUNCTION_TYPE = 'mean(' + property + ')';
        self.SELECTED_PROP = property;
        return self;
    };

    this.count = function () {
        self.FUNCTION_TYPE = 'count';
        return self;
    };

    this.barChart = function () {
        self.CHART_TYPE = 'barchart';
        return self;
    };

    this.background = function (color) {
    	self.BACKGROUND_COLOR = color;
    	return self;
    }

    this.json = function () {
        self.CHART_TYPE = 'type/json';
        return self;
    };

    var readyToProduceUrl = function() {
    	var result = false;
    	console.log(self);
    	if (self.OBJECT_TAGS.length !== 0
    		&& self.ACTION_TAGS.length !== 0
        	&& self.streamId !== undefined
        	&& self.FUNCTION_TYPE !== undefined
        	&& self.CHART_TYPE !== undefined) {
           result = true;
        }
        return result;
    }
    this.url = function () {
        if (readyToProduceUrl() === false) {
        	throw (new Error('Can\'t construct URL'));
        }

        var stringifyTags = function (tags) {
            var str = '';
            tags.forEach(function (tag) {
                str += tag + ',';
            });
            return str.slice(0, -1);
        }
        , objectTagsStr = stringifyTags(self.OBJECT_TAGS)
        , actionTagsStr = stringifyTags(self.ACTION_TAGS)
        , url = self.apiEndpoint + '/v1/streams/' + self.streamId + '/events/' + objectTagsStr + '/' +
            actionTagsStr + '/' + self.FUNCTION_TYPE + '/daily/' + self.CHART_TYPE +
            '?readToken=' + self.readToken;

        if ((self.BACKGROUND_COLOR !== undefined) && (self.BACKGROUND_COLOR !== '')) {
            url = url + '&bgColor=' + self.BACKGROUND_COLOR;
        }

        return url;
    };
}

function Stream(apiServer, streamId, writeToken, readToken, callbackUrl) {
	var self = this;
	self.apiServer = apiServer;
	self.streamId = streamId;
	self.writeToken = writeToken;
	self.readToken = readToken;
	self.callbackUrl = callbackUrl;

	self.sendCodes = {
		SEND_ERROR: 'couldn\' send event'
		, STREAM_NOT_FOUND: 'stream not found, check streamid and writeToken'
	}

	self.send = function(event, callback) {
		if (event.objectTags === undefined) {
			throw 'object tags must be specified';
		} else if (event.actionTags === undefined) {
			throw 'action tags must be specified';
		} else if (event.properties === undefined) {
			throw 'properties must be specified';
		}

		request({
			method: 'POST'
			, uri: self.apiServer + '/v1/streams/' + streamId + '/events'
			, gzip: true
			, headers: {
				'Authorization': writeToken
				, 'Content-type': 'application/json'
			}
			, json: true
			, body: event
		}
		, function(e, response, body) {
			if (e) {
				callback(self.sendCodes.SEND_ERROR, e);
				return;
			}

			if (response.statusCode === 404) {
				callback(self.sendCodes.STREAM_NOT_FOUND, response)
				return;
			}

			callback(null, body);
		})
	};

	this.toJSON = function() {
		var result = {
			streamId: streamId
			, writeToken: writeToken
			, readToken: readToken
			, callbackUrl: callbackUrl
		};

		return JSON.stringify(result);
	}

	this.visualize = function() {
		console.log(streamId);
		return new Visualization(apiServer, streamId, writeToken, readToken);
	}

}

var checkConfigIsValid = function (config) {
	if (config === undefined) {
		throw 'config object must be defined';
	}else if (config.appId === undefined) {
		throw 'appId must be specified';
	} else if (config.appSecret === undefined) {
		throw 'appSecret must be specified';
	} else if (config.callbackUrl === undefined){
		throw 'callbackUrl'
	}
}

function createStream (config, callback) {
	checkConfigIsValid(config);
	config.server = (config.server === undefined) ? 'http://sandbox.1self.co' : config.server;
	request({
		method: 'POST'
		, uri: config.server + '/v1/streams'
		, gzip: true
		, headers: {
			'Authorization': config.appId + ':' + config.appSecret
		}
		, json: true
		, body: {
			callbackUrl: config.callbackUrl
		}
	}, function(e, response, body) {
		var stream = new Stream(config.server, body.streamid, body.writeToken, body.readToken, body.callbackUrl);
		callback(e, stream);
	})
}

function loadStream (config, streamId, writeToken, readToken) {
	config.server = (config.server === undefined) ? 'http://sandbox.1self.co' : config.server;
	var stream = new Stream(config.server, streamId, writeToken, readToken);
	return stream;
}

exports.createStream = createStream;
exports.loadStream = loadStream;
