'use strict';

const _ = require('lodash');

const eyes = require('eyes'), p = _.bind(eyes.inspect, eyes);

/**
 * Object representation of an error that occurred on the server while performing a REST API operation.
 * @deprecated  You should never need to construct one of these directly; they will be provided to callbacks for REST API operations as the first argument if they occur.
 * @extends [Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)
 * @memberof module:classeur-api-client
 * @example
 * const ServerError = require('classeur-api-client').ServerError;
 * myClient.getFile('nonexistent', (error) => {
 *     if ( error instanceof ServerError ) {
 *         console.log(error.message); // e.g. 'Server error (400): bad request'
 *         console.log(error.reason); // e.g. 'File name is too short'
 *         console.log(error.status); // e.g. 400
 *         throw error;
 *     }
 * });
 */
class ServerError extends Error {
	/** @lends module:classeur-api-client.ServerError */
	constructor(request, data, response) {
		response = response || '';
		super(`Server error (${data.status || response.statusCode || undefined}): ${data.reason || response.statusMessage || undefined}`);
		if (response) {
			this.response = response;
		}

		/**
		 * A request object as returned by the `get` method of [restler](https://github.com/danwrong/restler).
		 * @summary The HTTP request object that caused the error.
		 * @deprecated  This is usually not useful.
		 * @type {Request}
		 * @instance
		 * @readonly
		 * @see The [restler source]{@link https://github.com/danwrong/restler/blob/master/lib/restler.js} for the Request constructor.
		 */
		this.request = request;
		/**
		 * JSON decoding failures will raise a {@link module:classeur-api-client.ClientError} instead.
		 * @summary The JSON-decoded data send back from the server with the error.
		 * @deprecated  This is usually not useful; the properties `reason`, `status`, and `shortReason` are usually all that is contained in `data`, and they are directly readable.
		 * @type {Object}
		 * @instance
		 * @readonly
		 */
		this.data = data;
		/**
		 * HTTP status code of the error.
		 * @type {Number}
		 * @instance
		 * @readonly
		 */
		this.status = data.status || response.statusCode || null;
		/**
		 * Information sent back by the server indicating why a request failed. This is usually the best source for detailed failure/debugging information.
		 * @type {String}
		 * @instance
		 * @readonly
		 */
		this.reason = data.reason || response.statusMessage || null;
		/**
		 * English version of [ServerError#status]{@link module:classeur-api-client.ServerError#status}.
		 * Usually a short word or phrase explaining what a given error code means in HTTP convention.
		 * @type {String}
		 * @instance
		 * @readonly
		 */
		this.shortReason = data.error || null;
	}
};

/**
 * Object representation of an error that occurred on the client during or after the processing REST API operation.
 * Example causes if a client error (and valid values for the `message` property) inclide:
 * - Request aborted
 * - Request timed out
 * - Corrupt/non-JSON-decodable content received
 *
 * ClientError instances sometimes wrap Restler errors. That means that, in addition to the properties listed below, ClientError instances can contain any properties that Restler attaches to its Error objects for `error`, `abort`, and `timeout` events.
 * @deprecated You should never need to construct one of these directly; they will be provided to callbacks for REST API operations as the first argument if they occur.
 * @extends [Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)
 * @memberof module:classeur-api-client
 * @see The [restler documentation](https://github.com/danwrong/restler) for more info on possible Error contents.
 * @example
 * const ClientError = require('classeur-api-client').ClientError;
 * myClient.getFile('nonexistent', (error) => {
 *     if ( error instanceof ClientError ) {
 *         console.log(error.message); // e.g. 'JSON decoding failed!'
 *         throw error;
 *     }
 * });
 */
class ClientError extends Error {
	/** @lends module:classeur-api-client.ClientError*/
	constructor(request, maybeError) {
		if ( _.isError(maybeError) ) {
			super(maybeError.message);
			_.merge(this, maybeError);
		} else if ( _.isPlainObject(maybeError) ) {
			super(maybeError.message);
			delete maybeError.message;
			_.merge(this, maybeError);
		} else {
			super(maybeError);
		}
		/**
		 * If a timeout occurred, this property will be set to the timeout threshold that was exceeded (in milliseconds). This property will only be set if a ClientError occurred due to a timeout.
		 * @memberOf module:classeur-api-client.ClientError
		 * @member {Number?} timeout
		 * @instance
		 * @readonly
		 * @see The [restler source]{@link https://github.com/danwrong/restler/blob/master/lib/restler.js} for the Request constructor.
		 */

		/**
		 * A request object as returned by the `get` method of [restler](https://github.com/danwrong/restler).
		 * @summary The HTTP request object that caused the error.
		 * @deprecated  This is usually not useful.
		 * @type {Request}
		 * @instance
		 * @readonly
		 * @see The [restler source]{@link https://github.com/danwrong/restler/blob/master/lib/restler.js} for the Request constructor.
		 */
		this.request = request;
	}
};

module.exports.ServerError = ServerError;
module.exports.ClientError = ClientError;