'use strict';

const _ = require('lodash'),
	expect = require('chai').expect;

const eyes = require('eyes'), p = eyes.inspect.bind(eyes);

class BaseError extends Error {
	constructor(error, body, response) {
		super(error)
		_.merge(this, body)
		_.merge(this, error)
		this.message = _.replace(this.message, /^\s*Error:\s*/, '')

		if (response) {
			/**
			 * JSON decoding failures will raise a {@link module:classeur-api-client.ClientError} instead.
			 * This field is only present if its value could be derived from the error object returned from the REST client.
			 * @summary The JSON-decoded data send back from the server with the error.
			 * @deprecated  This is usually not useful; the properties `reason`, `status`, and `shortReason` are usually all that is contained in `data`, and they are directly readable.
			 * @type {Object?}
			 * @instance
			 * @readonly
			 */
			this.response = response;
		}

		if ( body ) {
			/**
			 * JSON decoding failures will raise a {@link module:classeur-api-client.ClientError} instead.
			 * This field is only present if its value could be derived from the error object returned from the REST client.
			 * @summary The JSON-decoded data send back from the server with the error.
			 * @deprecated  This is usually not useful; the properties `reason`, `status`, and `shortReason` are usually all that is contained in `data`, and they are directly readable.
			 * @type {Object?}
			 * @instance
			 * @readonly
			 */
			this.data = body
		}

		if ( _.property('body.reason')(error) ) {
			/**
			 * This is usually the best source for detailed failure/debugging information.
			 * This field is only present if its value could be derived from the error object returned from the REST client.
			 * @summary Information sent back by the server indicating why a request failed. 
			 * @type {String?}
			 * @instance
			 * @readonly
			 */
			this.reason = error.body.reason
		}
		
		if ( _.property('body.error')(error) ) {
		 	/**
		 	 * This field is only present if its value could be derived from the error object returned from the REST client.
			 * Usually a short word or phrase explaining what a given error code means in HTTP convention.
		 	 * @summary English version of [ServerError#status]{@link module:classeur-api-client.ServerError#status}.
		 	 * @type {String?}
		 	 * @instance
		 	 * @readonly
		 	 */
		 	this.shortReason = error.body.error
		}
	}
}

/**
 * Object representation of an error that occurred on the server while performing a REST API operation.
 * This is a thin wrapper around a [flashheart](https://github.com/bbc/flashheart) error object, and exists only to deliniate server-caused errors from client-caused errors.
 * @deprecated  You should never need to construct one of these directly; they will be provided to callbacks for REST API operations as the first argument if they occur.
 * @extends [Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)
 * @memberof module:classeur-api-client
 * @see The [flashheart documentation](https://github.com/bbc/flashheart#errors) for more info on possible Error contents.
 * @example
 * const ServerError = require('classeur-api-client').ServerError;
 * myClient.getFile('nonexistent', (error) => {
 *     if ( error instanceof ServerError ) {
 *         console.log(error.message); // e.g. 'Server error: Received HTTP code 403 for GET https:// ...'
 *         console.log(error.reason); // e.g. 'file_is_not_readable'
 *         console.log(error.status); // e.g. 403
 *         throw error;
 *     }
 * });
 */
class ServerError extends BaseError {
	/** @lends module:classeur-api-client.ServerError */
	constructor(error, body, response) {
		super(error, body, response)
		this.message = "Server error: " + this.message
		expect(error.statusCode, 'statusCode attribute not found!').to.be.ok;
		/**
		 * If headers were returned from the server with the error, this object will contain their contents. It is supplied directly by the flashheart REST client library.
		 * @memberOf module:classeur-api-client.ServerError
		 * @member {Object} headers
		 * @instance
		 * @readonly
		 * @see The [flashheart documentation]{@link https://github.com/bbc/flashheart#errors} for more information about this field's contents.
		 */

		/**
		 * HTTP status code of the error.
		 * @type {Number}
		 * @instance
		 * @readonly
		 */
		this.status = error.statusCode		
	}
};

/**
 * Object representation of an error that occurred on the client during or after the processing REST API operation.
 * Example causes if a client error (and valid values for the `message` property) include:
 * - Request aborted
 * - Request timed out
 * - Corrupt/non-JSON-decodable content received
 *
 * ClientError instances are usually thin wrappers around [flashheart](https://github.com/bbc/flashheart) error objects, and exist only to deliniate server-caused errors from client-caused errors. ClientErrors may not contain all/most error fields supplied by flashheart, though, since ClientErrors may occur before error metadata is returned from the server.
 * @deprecated You should never need to construct one of these directly; they will be provided to callbacks for REST API operations as the first argument if they occur.
 * @extends [Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)
 * @memberof module:classeur-api-client
 * @see The [flashheart documentation](https://github.com/bbc/flashheart#errors) for more info on possible Error contents.
 * @example
 * const ClientError = require('classeur-api-client').ClientError;
 * myClient.getFile('nonexistent', (error) => {
 *     if ( error instanceof ClientError ) {
 *         console.log(error.message); // e.g. 'JSON decoding failed!'
 *         throw error;
 *     }
 * });
 */
class ClientError extends BaseError {
	/** @lends module:classeur-api-client.ClientError*/
	constructor(error, body, response, clntimeout) {
		super(error, body, response)
		this.message = "Client error: " + this.message

		if ( error.message.includes("ETIMEDOUT") ) {
			/**
			 * If a timeout occurred, this property will be set to the timeout threshold that was exceeded, in milliseconds. This property will only be set if a ClientError occurred due to a timeout.
			 * @instance
			 * @readonly
			 * @see The [restler source]{@link https://github.com/danwrong/restler/blob/master/lib/restler.js} for the Request constructor.
			 */
		    this.timeout = clntimeout
		}
	}
};

module.exports.ServerError = ServerError;
module.exports.ClientError = ClientError;