'use strict';
/**
* Node.js client for the REST API of [Classeur](http://classeur.io/)
*
* **This is alpha software:** this is the first release of this client library. While I've done my best to write thorough unit and integration tests, there may be bugs, and the API is subject to change in future versions.
 * @example <caption>Installation</caption>
 * npm install classeur-api-client
 * @example <caption>Usage</caption>
 * const ClasseurClient = require('classeur-api-client');
 *
 * const myClient = new ClasseurClient({ userId: "my id", apiKey: "my key" });
 *
 * myClient.getFile("some file id", function(error, result) {
 *     console.log(`Got a file called ${result.name}`);
 *     console.log(`...and some markdown: ${result.content.text}`);
 * });
 * @see The [ClasseurClient]{@link module:classeur-api-client~ClasseurClient} class for API usage information.
 * @see The [README](index.html) for an overview and more usage examples.
 * @see The [source code]{@link https://github.com/zbentley/classeur-api-client} on GitHub.
 * @module classeur-api-client
 */
const _ = require('lodash'),
    async = require('async'),
    RestClient = require('node-rest-client').Client,
    functionUtils = require('./function-utils');

function query(path, args, cb) {
    args.headers = {
        'x-agent-info': 'github.com/zbentley/classeur-api-client'
    };

    let req = this.RestClient.get(this.root + path, args, function(data, response) {
        if ( response.statusCode == 200 ) {
            cb(null, JSON.parse(data));
        } else {
            cb(`Got an error (${response.statusCode}): ${response.statusMessage}`, null);
        }
    });

    req.on('requestTimeout',function(req){
        req.abort();
        cb('request expired', null);
    });

    req.on('responseTimeout', _.partial(cb, 'request timed out', null));
    req.on('error',  _.partialRight(cb, null));
}

function multiQuery(type, wantArray, Array, cb) {
    const self = this;

    async.map(
        Array,
        function(item, cb) {
            _.bind(query, self, type + item, {}, cb)();
        },
        functionUtils.scrubArrayCallback(cb, wantArray)
    );
}

function metadataQuery(field, wantArray, ids, cb) {
    _.bind(query, this)(
        'metadata/' + field,
        {
            parameters: {
                id: ids.join(','),
            }
        },
        functionUtils.scrubArrayCallback(cb, wantArray)
    );
}

/** Object-oriented interface to the Classeur REST API. */
class ClasseurClient {
    /**
     * Constructs a new API client.
     * @param {string} userId - Classeur user ID string.
     * @param {string} apiKey - API Key string. Keep this secret.
     * @param {string} [host=app.classeur.io] - Fully qualified hostname to connect to. Connections will be made with HTTPS, regardless of whether the hostname is prefixed with `http://` or `https://`.
     */
    constructor(userId, apiKey, host) {
        host = host || 'app.classeur.io';
        this.RestClient = new RestClient({
            user: userId,
            password: apiKey,
        });
        host.replace(/\Ahttps?:[/][/]/g, '');
        this.root = `https://${host}/api/v1/`;
    }
};

module.exports = ClasseurClient;

Object.assign(
    module.exports.prototype,
    // Has to lend the prototype, otherwise the methods show up as static.
    /** @lends module:classeur-api-client~ClasseurClient */
    {
        /**
         * Retrieve one or more files.
         * @method
         * @instance
         * @access public
         * @param {String[]} &#91;ids&#93; - Array of Classeur file IDs to retrieve.
         * @param {module:classeur-api-client.ScrubbedCallback} callback - Called with `(error, result)`.
         * - `result` will be an Array of [File]{@link module:classeur-api-client.File}  objects, or `null` on error.
         *//**
         * Retrieve one or more files.
         * Like {@link ClasseurClient#getFiles}, but with spread: accepts a variable number of file IDs in the arguments, instead of an Array.
         * @method
         * @instance
         * @access public
         * @variation 2
         * @param {...String} &hellip;ids - Classeur file IDs to retrieve.
         * @param {module:classeur-api-client.ScrubbedCallback} callback - Called with `(error, result)`.
         * - `result` will be an Array of [File]{@link module:classeur-api-client.File}  objects, or `null` on error.
         */
        getFiles: _.partial(functionUtils.restOrArrayAndCallback(multiQuery), 'files/', true),
        /**
         * Retrieve a single file.
         * @method
         * @instance
         * @access public
         * @param {String} id - Classeur file ID to retrieve.
         * @param {module:classeur-api-client.ScrubbedCallback} callback - Called with `(error, result)`.
         * - `result` will be a [File]{@link module:classeur-api-client.File} object, or `null` on error.
         */
        getFile: _.partial(functionUtils.singleElementAndCallback(multiQuery), 'files/', false),
        /**
         * Retrieve one or more folders.
         * @method
         * @instance
         * @access public
         * @param {String[]} &#91;ids&#93; - Array of Classeur folder IDs to retrieve.
         * @param {module:classeur-api-client.ScrubbedCallback} callback - Called with `(error, result)`.
         * - `result` will be an Array of [Folder]{@link module:classeur-api-client.Folder} objects, or `null` on error.
         *//**
         * Like {@link ClasseurClient#getFolders}, but with spread: accepts a variable number of folder IDs in the arguments, instead of an Array.
         * @method
         * @instance
         * @access public
         * @variation 2
         * @param {...String} &hellip;ids - Classeur folder IDs to retrieve.
         * @param {module:classeur-api-client.ScrubbedCallback} callback - Called with `(error, result)`.
         * - `result` will be an Array of [Folder]{@link module:classeur-api-client.Folder} objects, or `null` on error.
         */
        getFolders: _.partial(functionUtils.restOrArrayAndCallback(multiQuery), 'folders/', true),
        /**
         * Retrieve a single folder.
         * @method
         * @instance
         * @access public
         * @param {String} id - Classeur folder ID to retrieve.
         * @param {module:classeur-api-client.ScrubbedCallback} callback - Called with `(error, result)`.
         * - `result` will be a [Folder]{@link module:classeur-api-client.Folder} object, or `null` on error.
         */
        getFolder: _.partial(functionUtils.singleElementAndCallback(multiQuery), 'folders/', false),
        /**
         * Retrieve all users on the Classeur account to which the ClasseurClient is connected.
         * @method
         * @instance
         * @access public
         * @param {module:classeur-api-client.ScrubbedCallback} callback - Called with `(error, result)`.
         * - `result` will be an Array of [User]{@link module:classeur-api-client.User} objects, or `null` on error.
         */
        getUsers: _.partial(functionUtils.singleElementAndCallback(multiQuery), 'users', true, ''),
        /**
         * Retrieve metadata for one or more users.
         * @method
         * @instance
         * @access public
         * @param {String[]} &#91;ids&#93; - Array of Classeur user IDs for which to retrieve metadata.
         * @param {module:classeur-api-client.ScrubbedCallback} callback - Called with `(error, result)`.
         * - `result` will be an Array of [UserMetadata]{@link module:classeur-api-client.UserMetadata} objects, or `null` on error.
         *//**
         * Like {@link ClasseurClient#getUsersMetadata}, but with spread: accepts a variable number of folder IDs in the arguments, instead of an Array.
         * @method
         * @instance
         * @access public
         * @variation 2
         * @param {...String} &hellip;ids - Classeur user IDs for which to retrieve metadata.
         * @param [callback]{module:classeur-api-client.ScrubbedCallback} callback - Called with `(error, result)`.
         * - `result` will be an Array of [UserMetadata]{@link module:classeur-api-client.UserMetadata} objects, or `null` on error.
         */
        getUsersMetadata: _.partial(functionUtils.restOrArrayAndCallback(metadataQuery), 'users', true),
        /**
         * Retrieve metadata for one or more folders.
         * @method
         * @instance
         * @access public
         * @param {String[]} &#91;ids&#93; - Array of Classeur folder IDs for which to retrieve metadata.
         * @param {module:classeur-api-client.ScrubbedCallback} callback - Called with `(error, result)`.
         * - `result` will be an Array of [FolderMetadata]{@link module:classeur-api-client.FolderMetadata} objects, or `null` on error.
         *//**
         * Like {@link ClasseurClient#getUsersMetadata}, but with spread: accepts a variable number of folder IDs in the arguments, instead of an Array.
         * @method
         * @instance
         * @access public
         * @variation 2
         * @param {...String} &hellip;ids - Classeur folder IDs for which to retrieve metadata.
         * @param {module:classeur-api-client.ScrubbedCallback} callback - Called with `(error, result)`.
         * - `result` will be an Array of [FolderMetadata]{@link module:classeur-api-client.FolderMetadata} objects, or `null` on error.
         */
        getFoldersMetadata: _.partial(functionUtils.restOrArrayAndCallback(metadataQuery), 'files', true),
        /**
         * Retrieve metadata for one or more files.
         * @method
         * @instance
         * @access public
         * @param {String[]} &#91;ids&#93; - Array of Classeur file IDs for which to retrieve metadata.
         * @param {module:classeur-api-client.ScrubbedCallback} callback - Called with `(error, result)`.
         * - `result` will be an Array of [FileMetadata]{@link module:classeur-api-client.FileMetadata} objects, or `null` on error.
         *//**
         * Like {@link ClasseurClient#getUsersMetadata}, but with spread: accepts a variable number of folder IDs in the arguments, instead of an Array.
         * @method
         * @instance
         * @access public
         * @variation 2
         * @param {...String} &hellip;ids - Classeur file IDs for which to retrieve metadata.
         * @param {module:classeur-api-client.ScrubbedCallback} callback - Called with `(error, result)`.
         * - `result` will be an Array of [FileMetadata]{@link module:classeur-api-client.FileMetadata} objects, or `null` on error.
         */
        getFilesMetadata: _.partial(functionUtils.restOrArrayAndCallback(metadataQuery), 'folders', true),
        /**
         * Retrieve metadata for a user.
         * @method
         * @instance
         * @access public
         * @param {String} id - The Classeur user ID for which to retrieve metadata.
         * @param {module:classeur-api-client.ScrubbedCallback} callback - Called with `(error, result)`.
         * - `result` will be a [UserMetadata]{@link module:classeur-api-client.UserMetadata} object, or `null` on error.
         */
        getUserMetadata: _.partial(functionUtils.singleElementAndCallback(metadataQuery), 'users', false),
        /**
         * Retrieve metadata for a file.
         * @method
         * @instance
         * @access public
         * @param {String} id - The Classeur file ID for which to retrieve metadata.
         * @param {module:classeur-api-client.ScrubbedCallback} callback - Called with `(error, result)`.
         * - `result` will be a [FileMetadata]{@link module:classeur-api-client.FileMetadata} object, or `null` on error.
         */
        getFileMetadata: _.partial(functionUtils.singleElementAndCallback(metadataQuery), 'files', false),
        /**
         * Retrieve metadata for a folder.
         * @method
         * @instance
         * @access public
         * @param {String} id - The Classeur folder ID for which to retrieve metadata.
         * @param {module:classeur-api-client.ScrubbedCallback} callback - Called with `(error, result)`.
         * - `result` will be a [FolderMetadata]{@link module:classeur-api-client.FolderMetadata} object, or `null` on error.
         */
        getFolderMetadata: _.partial(functionUtils.singleElementAndCallback(metadataQuery), 'folders', false)
    }
);