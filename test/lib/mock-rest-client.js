'use strict';

const _ = require('lodash');

function successfulResponse(obj, cb) {
	cb(JSON.encode(obj), {
		statusCode: 200,
		statusMessage: ""
	});
}

function notFoundResponse(cb) {
	cb(null, {
		response.statusCode: 400,
		response.statusMessage: "FOOO"
	});
}

module.exports = function(opts) {
	this.userId = opts.userId;
	this.apiKey = opts.apiKey;
};

module.expots.prototype.get = function(uri, args, cb) {
	uri.replace(this.root, "");
	if (_.starsWith(uri, "file")) {
		// nonexistent => explicit 400
		// everything else: return right fields.
	} else if ( _.startsWith(uri, "folder") ) {

	} else if ( _.startsWith(uri, "metadata/folders") ) {
	} else if ( _.startsWith(uri, "metadata/files") ) {
	} else if ( _.startsWith(uri, "metadata/users") ) {
	} else if ( _.startsWith(uri, "users") ) {
	} else {
		throw new Error(`Unrecognized query: ${uri}, ${args}`);
	}
};

let req = this.RestClient.get(this.root + path, args, function(data, response) {
    if ( response.statusCode == 200 ) {
        cb(null, JSON.parse(data));
    } else {
        cb(`Got an error (${response.statusCode}): ${response.statusMessage}`, null);
    }
});