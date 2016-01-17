'use strict';

const _ = require('lodash');

module.exports.ServerError = class ServerError extends Error {
	constructor(request, data, response) {
		response = response || '';
		super(`Server error (${response.statusCode || undefined}): ${response.statusMessage || undefined}`);
		if (response) {
			this.response = response;
		}
		this.request = request;
		this.data = data;
	}
};

module.exports.ClientError = class ClientError extends Error {
	constructor(request, maybeError) {
		let error;
		if ( _.isError(maybeError) ) {
			super(maybeError.message);
			_.merge(this, maybeError);
		} else if ( _.isObject(maybeError) ) {
			super(maybeError.message);
			delete maybeError.message;
			_.merge(this, maybeError);
		} else {
			super(maybeError);
		}
		this.request = request;
	}
};