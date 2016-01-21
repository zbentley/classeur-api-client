'use strict';

/**
* Node.js client for the REST API of [Classeur](http://classeur.io/).
*
* @example <caption>Installation</caption>
* npm install classeur-api-client
* @example <caption>Usage</caption>
* const ClasseurClient = require('classeur-api-client');
*
* const myClient = new ClasseurClient('my user id', 'my api key');
*
* myClient.getFile('some file id', function(error, result) {
*     console.log(`Got a file called ${result.name}`);
*     console.log(`...and some markdown: ${result.content.text}`);
* });
* @see The [ClasseurClient]{@link module:classeur-api-client.ClasseurClient} class for API usage information.
* @see The [README](index.html) for an overview and more usage examples.
* @see The [source code]{@link https://github.com/zbentley/classeur-api-client} on GitHub.
* @see [classeur-downloader]{@link http://zbentley.github.io/classeur-downloader/versions/latest} for an example use case for this module.
* @module classeur-api-client
*/

const _ = require('lodash'),
    async = require('async'),
    restler = require('restler'),
    functionUtils = require('./lib/function-utils'),
    errors = require('./lib/errors');

// const eyes = require('eyes'), p = eyes.inspect.bind(eyes);

/**
 * Constructs a new API client.
 * @static
 * @param {String} userId - Classeur user ID string.
 * @param {String} apiKey - API Key string. Keep this secret.
 * @param {String} [host=app.classeur.io] - Fully qualified hostname to connect to. Connections will be made with HTTPS, regardless of whether the hostname is prefixed with `http://` or `https://`.
 */
class ClasseurClient {
    constructor(userId, apiKey, host) {
        host = host || 'app.classeur.io';
        host.replace(/\Ahttps?:[/][/]/g, '');
        this._client = restler; // Stored for dependency injection in testing.
        this.root = `https://${host}/api/v1/`;
        this.userId = userId;
        this.apiKey = apiKey;
    }

    /**
     * Retrieve one or more files.
     * @method
     * @param {...(String|String[])} &hellip;ids|&#91;ids&#93; - An Array of strings, or multiple string arguments, each representing a Classeur file ID to retrieve.
     * - See {@tutorial Plural Functions} for more information on functions that can be called with an array or with variadic arguments.
     * - One REST call is made (in parallel) per ID supplied.
     * @param {module:classeur-api-client.ScrubbedCallback} callback - Called with `(error, result)`. See [ScrubbedCallback]{@link module:classeur-api-client.ScrubbedCallback} for more info.
     * - `result` will be an Array of [File]{@link module:classeur-api-client.File}  objects, or `null` on error.
     */
    getFiles() {
        functionUtils.restOrArrayAndCallback(this.multiQuery, this)('files/', true, ...arguments);
    }

    /**
     * Retrieve a single file.
     * @param {String} id - Classeur file ID to retrieve.
     * @param {module:classeur-api-client.ScrubbedCallback} callback - Called with `(error, result)`. See [ScrubbedCallback]{@link module:classeur-api-client.ScrubbedCallback} for more info.
     * - `result` will be a [File]{@link module:classeur-api-client.File} object, or `null` on error.
     */
    getFile(id, cb) {
        functionUtils.singleElementAndCallback(this.multiQuery, this)('files/', false, id, cb);
    }

    /**
     * Retrieve one or more folders.
     * @param {...(String|String[])} &hellip;ids|&#91;ids&#93; - An Array of strings, or multiple string arguments, each representing a Classeur folder ID to retrieve.
     * - See {@tutorial Plural Functions} for more information on functions that can be called with an array or with variadic arguments.
     * - One REST call is made (in parallel) per ID supplied.
     * @param {module:classeur-api-client.ScrubbedCallback} callback - Called with `(error, result)`. See [ScrubbedCallback]{@link module:classeur-api-client.ScrubbedCallback} for more info.
     * - `result` will be an Array of [Folder]{@link module:classeur-api-client.Folder} objects, or `null` on error.
     */
    getFolders() {
        functionUtils.restOrArrayAndCallback(this.multiQuery, this)('folders/', true, ...arguments);
    }

    /**
     * Retrieve a single folder.
     * @param {String} id - Classeur folder ID to retrieve.
     * @param {module:classeur-api-client.ScrubbedCallback} callback - Called with `(error, result)`. See [ScrubbedCallback]{@link module:classeur-api-client.ScrubbedCallback} for more info.
     * - `result` will be a [Folder]{@link module:classeur-api-client.Folder} object, or `null` on error.
     */
    getFolder(id, cb) {
        functionUtils.singleElementAndCallback(this.multiQuery, this)('folders/', false, id, cb);
    }

    /**
     * Retrieve all users on the Classeur account to which the ClasseurClient is connected.
     * @param {module:classeur-api-client.ScrubbedCallback} callback - Called with `(error, result)`. See [ScrubbedCallback]{@link module:classeur-api-client.ScrubbedCallback} for more info.
     * - `result` will be an Array of [User]{@link module:classeur-api-client.User} objects, or `null` on error.
     */
    getUsers(cb) {
        this.query('users', {}, cb);
    }

    /**
     * Retrieve metadata for one or more users.
     * @param {...(String|String[])} &hellip;ids|&#91;ids&#93; - An Array of strings, or multiple string arguments, each representing a Classeur user IDs for which to retrieve metadata.
     * - See {@tutorial Plural Functions} for more information on functions that can be called with an array or with variadic arguments.
     * @param {module:classeur-api-client.ScrubbedCallback} callback - Called with `(error, result)`. See [ScrubbedCallback]{@link module:classeur-api-client.ScrubbedCallback} for more info.
     * - `result` will be an Array of [UserMetadata]{@link module:classeur-api-client.UserMetadata} objects, or `null` on error.
     */
    getUsersMetadata() {
        functionUtils.restOrArrayAndCallback(this.metadataQuery, this)('users', true, ...arguments);
    }

    /**
     * Retrieve metadata for one or more folders.
     * @param {...(String|String[])} &hellip;ids|&#91;ids&#93; - An Array of strings, or multiple string arguments, each representing a Classeur folder IDs for which to retrieve metadata.
     * - See {@tutorial Plural Functions} for more information on functions that can be called with an array or with variadic arguments.
     * @param {module:classeur-api-client.ScrubbedCallback} callback - Called with `(error, result)`. See [ScrubbedCallback]{@link module:classeur-api-client.ScrubbedCallback} for more info.
     * - `result` will be an Array of [FolderMetadata]{@link module:classeur-api-client.FolderMetadata} objects, or `null` on error.
     */
    getFoldersMetadata() {
        functionUtils.restOrArrayAndCallback(this.metadataQuery, this)('folders', true, ...arguments);
    }

    /**
     * Retrieve metadata for one or more files.
     * @param {...(String|String[])} &hellip;ids|&#91;ids&#93; - An Array of strings, or multiple string arguments, each representing a Classeur file IDs for which to retrieve metadata.
     * - See {@tutorial Plural Functions} for more information on functions that can be called with an array or with variadic arguments.
     * @param {module:classeur-api-client.ScrubbedCallback} callback - Called with `(error, result)`. See [ScrubbedCallback]{@link module:classeur-api-client.ScrubbedCallback} for more info.
     * - `result` will be an Array of [FileMetadata]{@link module:classeur-api-client.FileMetadata} objects, or `null` on error.
     */
    getFilesMetadata() {
        functionUtils.restOrArrayAndCallback(this.metadataQuery, this)('files', true, ...arguments);
    }

    /**
     * Retrieve metadata for a user.
     * @param {String} id - The Classeur user ID for which to retrieve metadata.
     * @param {module:classeur-api-client.ScrubbedCallback} callback - Called with `(error, result)`. See [ScrubbedCallback]{@link module:classeur-api-client.ScrubbedCallback} for more info.
     * - `result` will be a [UserMetadata]{@link module:classeur-api-client.UserMetadata} object, or `null` on error.
     */
    getUserMetadata(id, cb) {
        functionUtils.singleElementAndCallback(this.metadataQuery, this)('users', false, id, cb);
    }

    /**
     * Retrieve metadata for a file.
     * @param {String} id - The Classeur file ID for which to retrieve metadata.
     * @param {module:classeur-api-client.ScrubbedCallback} callback - Called with `(error, result)`. See [ScrubbedCallback]{@link module:classeur-api-client.ScrubbedCallback} for more info.
     * - `result` will be a [FileMetadata]{@link module:classeur-api-client.FileMetadata} object, or `null` on error.
     */
    getFileMetadata(id, cb) {
        functionUtils.singleElementAndCallback(this.metadataQuery, this)('files', false, id, cb);
    }

    /**
     * Retrieve metadata for a folder.
     * @param {String} id - The Classeur folder ID for which to retrieve metadata.
     * @param {module:classeur-api-client.ScrubbedCallback} callback - Called with `(error, result)`. See [ScrubbedCallback]{@link module:classeur-api-client.ScrubbedCallback} for more info.
     * - `result` will be a [FolderMetadata]{@link module:classeur-api-client.FolderMetadata} object, or `null` on error.
     */
    getFolderMetadata(id, cb) {
        functionUtils.singleElementAndCallback(this.metadataQuery, this)('folders', false, id, cb);
    }

    /** @private */
    metadataQuery(field, wantArray, ids, cb) {
        this.query(
            'metadata/' + field,
            {
                query: {
                    id: ids.join(','),
                }
            },
            functionUtils.scrubArrayCallback(cb, wantArray, ids.length)
        );
    }

    multiQuery(type, wantArray, array, cb) {
        async.map(
            array,
            (item, cb) => { this.query(type + item, {}, cb) },
            functionUtils.scrubArrayCallback(cb, wantArray, array.length)
        );
    }

    query(path, args, cb) {
        _.merge(args, {
            headers: {
                'x-agent-info': 'github.com/zbentley/classeur-api-client'
            },
            username: this.userId,
            password: this.apiKey,
            parser: this._client.parsers.json
        });

        // _.once keeps the abort handler from calling the callback more than once.
        cb = _.once(cb);
        const request = this._client.get(this.root + path, args),
            errorCallback = function(error) {
                cb(error, null);
                if ( ! request.aborted ) {
                    request.abort();
                }
            };

        // Currying with arity prevents the response object from being passed
        // to unsuspecting callbacks.
        request.on('success', _.curry(cb, 2)(null));

        request.on('fail', function(data, response) {
            errorCallback(new errors.ServerError(request, data, response));
        });

        request.on('error', function(error){
            errorCallback(new errors.ClientError(request, error));
        });

        request.on('abort', _.partial(errorCallback, new errors.ClientError(request, {
            message: 'Request aborted'
        })));

        request.on('timeout', function(ms){
            errorCallback(new errors.ClientError(request, {
                message: 'Request timed out',
                timeout: ms
            }));
        });
    }
    // Proxies for the error constructors so we don't have to add another module
    // to the package.
    static get ServerError() { return errors.ServerError; }
    static get ClientError() { return errors.ClientError; }
};

module.exports = ClasseurClient;