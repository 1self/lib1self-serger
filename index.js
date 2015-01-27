var request = require('request'),
	config = {};

exports.sandbox = 'http://sandbox.1self.co';
exports.production = 'https://api.1self.co';

function Stream(streamId, writeToken, readToken) {
	var s = streamId,
		w = writeToken,
		r = readToken;

	this.send = function(event, callback) {
		if (event.objectTags === undefined) {
			throw 'object tags must be specified';
		} else if (event.actionTags === undefined) {
			throw 'action tags must be specified';
		} else if (event.properties === undefined) {
			throw 'properties must be specified';
		}

		request({
			method: 'POST',
			uri: config.server + '/v1/streams/' + s,
			gzip: true,
			headers: {
				'Authorization': w,
				'Content-type': 'application/json'
			},
			body: event
		}, function(e, response, body) {
			if (e) {
				callback(e);
			}

			console.log('Logged the event');
			callback(null, JSON.parse(body));
		})
	}

	this.toJSON = function() {
		var result = {
			streamId: s,
			writeToken: w,
			readToken: r
		};

		return JSON.stringify(result);
	}
}

function Lib1selfserver(c) {
	config = {
		server: 'http://sandbox.1self.co'
	};

	if (c === undefined) {
		throw 'config object must be defined';
	}
	if (c.appId === undefined) {
		throw 'appId must be specified';
	} else if (c.appSecret === undefined) {
		throw 'appSecret must be specified';
	}

	config.appId = c.appId;
	config.appSecret = c.appSecret;
	config.server = c.server === undefined ? config.server : c.server;

	this.createStream = function(callback) {
		request({
			method: 'POST',
			uri: config.server + '/v1/streams',
			gzip: true,
			headers: {
				'Authorization': config.appId + ':' + config.appSecret
			}
		}, function(e, response, body) {
			if (e) {
				callback(e);
			}

			console.log(body);
			var stream = new Stream(body.streamId, body.writeToken, body.readToken);
			callback(null, stream);
		})
	}
}

exports.Lib1selfserver = Lib1selfserver;