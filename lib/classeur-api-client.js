'use strict';

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

/**
 * Constructs a new API client.
 * @classdesc Object-oriented interface to the Classeur REST API.
 * @class ClasseurClient
 * @example
 * const ClasseurClient = require('classeur-api-client'),
 *      client = new ClasseurClient('my user id', 'my api key');
 * @param {string} userId - Classeur user ID string.
 * @param {string} apiKey - API Key string. Keep this secret.
 * @param {string} [host=app.classeur.io] - Fully qualified hostname to connect to. Can be prefixed with `http://` or `https://`.
 * @returns {Object} Returns a ClasseurClient instance.
 */
module.exports = class {
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

Object.assign(
    module.exports.prototype,
    // Has to lend the prototype, otherwise the methods show up as static.
    /** @lends ClasseurClient.prototype */
    {
        /**
         * Retrieve one or more files.
         * @method
         * @param {String[]} ids - Array of Classeur file IDs to retrieve.
         * @param {ClasseurClient~scrubbedCallback(?(Error))} callback - Called with `(error, result)`.
         * - `result` will be an Array of {@link ClasseurClient~File} objects, or `null` on error.
         *//**
         * Retrieve one or more files.
         * Like {@link ClasseurClient#getFiles}, but with spread: accepts a variable number of file IDs in the arguments, instead of an Array.
         * @method
         * @variation 2
         * @param {...String} ids - Classeur file IDs to retrieve.
         * @param {ClasseurClient~scrubbedCallback} callback - Called with `(error, result)`.
         * - `result` will be an Array of {@link ClasseurClient~File} objects, or `null` on error.
         */
        getFiles: _.partial(functionUtils.restOrArrayAndCallback(multiQuery), 'files/', true),
        /**
         * Retrieve a single file.
         * @method
         * @param {String} id - Classeur file ID to retrieve.
         * @param {ClasseurClient~scrubbedCallback} callback - Called with `(error, result)`.
         * - `result` will be a {@link ClasseurClient~File} object, or `null` on error.
         */
        getFile: _.partial(functionUtils.singleElementAndCallback(multiQuery), 'files/', false),
        /**
         * Retrieve one or more folders.
         * @method
         * @param {String[]} ids - Array of Classeur folder IDs to retrieve.
         * @param {ClasseurClient~scrubbedCallback} callback - Called with `(error, result)`.
         * - `result` will be an Array of {@link ClasseurClient~Folder} objects, or `null` on error.
         *//**
         * Like {@link ClasseurClient#getFolders}, but with spread: accepts a variable number of folder IDs in the arguments, instead of an Array.
         * @method
         * @variation 2
         * @param {...String} ids - Classeur folder IDs to retrieve.
         * @param {ClasseurClient~scrubbedCallback} callback - Called with `(error, result)`.
         * - `result` will be an Array of {@link ClasseurClient~Folder} objects, or `null` on error.
         */
        getFolders: _.partial(functionUtils.restOrArrayAndCallback(multiQuery), 'folders/', true),
        /**
         * Retrieve a single folder.
         * @method
         * @param {String} id - Classeur folder ID to retrieve.
         * @param {ClasseurClient~scrubbedCallback} callback - Called with `(error, result)`.
         * - `result` will be a {@link ClasseurClient~Folder} object, or `null` on error.
         */
        getFolder: _.partial(functionUtils.singleElementAndCallback(multiQuery), 'folders/', false),
        /**
         * Retrieve all users on the Classeur account to which the ClasseurClient is connected.
         * @method
         * @param {ClasseurClient~scrubbedCallback} callback - Called with `(error, result)`.
         * - `result` will be an Array of {@link ClasseurClient~User} objects, or `null` on error.
         */
        getUsers: _.partial(functionUtils.singleElementAndCallback(multiQuery), 'users', true, ''),
        /**
         * Retrieve metadata for one or more users.
         * @method
         * @param {String[]} ids - Array of Classeur user IDs for which to retrieve metadata.
         * @param {ClasseurClient~scrubbedCallback} callback - Called with `(error, result)`.
         * - `result` will be an Array of {@link ClasseurClient~UserMetadata} objects, or `null` on error.
         *//**
         * Like {@link ClasseurClient#getUsersMetadata}, but with spread: accepts a variable number of folder IDs in the arguments, instead of an Array.
         * @method
         * @variation 2
         * @param {...String} ids - Classeur user IDs for which to retrieve metadata.
         * @param {ClasseurClient~scrubbedCallback} callback - Called with `(error, result)`.
         * - `result` will be an Array of {@link ClasseurClient~UserMetadata} objects, or `null` on error.
         */
        getUsersMetadata: _.partial(functionUtils.restOrArrayAndCallback(metadataQuery), 'users', true),
        /**
         * Retrieve metadata for one or more folders.
         * @method
         * @param {String[]} ids - Array of Classeur folder IDs for which to retrieve metadata.
         * @param {ClasseurClient~scrubbedCallback} callback - Called with `(error, result)`.
         * - `result` will be an Array of {@link ClasseurClient~FolderMetadata} objects, or `null` on error.
         *//**
         * Like {@link ClasseurClient#getUsersMetadata}, but with spread: accepts a variable number of folder IDs in the arguments, instead of an Array.
         * @method
         * @variation 2
         * @param {...String} ids - Classeur folder IDs for which to retrieve metadata.
         * @param {ClasseurClient~scrubbedCallback} callback - Called with `(error, result)`.
         * - `result` will be an Array of {@link ClasseurClient~FolderMetadata} objects, or `null` on error.
         */
        getFoldersMetadata: _.partial(functionUtils.restOrArrayAndCallback(metadataQuery), 'files', true),
        /**
         * Retrieve metadata for one or more files.
         * @method
         * @param {String[]} ids - Array of Classeur file IDs for which to retrieve metadata.
         * @param {ClasseurClient~scrubbedCallback} callback - Called with `(error, result)`.
         * - `result` will be an Array of {@link ClasseurClient~FileMetadata} objects, or `null` on error.
         *//**
         * Like {@link ClasseurClient#getUsersMetadata}, but with spread: accepts a variable number of folder IDs in the arguments, instead of an Array.
         * @method
         * @variation 2
         * @param {...String} ids - Classeur file IDs for which to retrieve metadata.
         * @param {ClasseurClient~scrubbedCallback} callback - Called with `(error, result)`.
         * - `result` will be an Array of {@link ClasseurClient~FileMetadata} objects, or `null` on error.
         */
        getFilesMetadata: _.partial(functionUtils.restOrArrayAndCallback(metadataQuery), 'folders', true),
        /**
         * Retrieve metadata for a user.
         * @method
         * @param {String} id - The Classeur user ID for which to retrieve metadata.
         * @param {ClasseurClient~scrubbedCallback} callback - Called with `(error, result)`.
         * - `result` will be a {@link ClasseurClient~UserMetadata} object, or `null` on error.
         */
        getUserMetadata: _.partial(functionUtils.singleElementAndCallback(metadataQuery), 'users', false),
        /**
         * Retrieve metadata for a file.
         * @method
         * @param {String} id - The Classeur file ID for which to retrieve metadata.
         * @param {ClasseurClient~scrubbedCallback} callback - Called with `(error, result)`.
         * - `result` will be a {@link ClasseurClient~FileMetadata} object, or `null` on error.
         */
        getFileMetadata: _.partial(functionUtils.singleElementAndCallback(metadataQuery), 'files', false),
        /**
         * Retrieve metadata for a folder.
         * @method
         * @param {String} id - The Classeur folder ID for which to retrieve metadata.
         * @param {ClasseurClient~scrubbedCallback} callback - Called with `(error, result)`.
         * - `result` will be a {@link ClasseurClient~FolderMetadata} object, or `null` on error.
         */
        getFolderMetadata: _.partial(functionUtils.singleElementAndCallback(metadataQuery), 'folders', false)
    }
);