'use strict'

/**
* Node.js client for the REST API of [Classeur](http://classeur.io/).
*
* @example <caption>Installation</caption>
* npm install classeur-api-client
* @example <caption>Usage</caption>
* const ClasseurClient = require('classeur-api-client')
*
* const myClient = new ClasseurClient('my user id', 'my api key')
*
* myClient.getFile('some file id', function(error, result) {
*     console.log(`Got a file called ${result.name}`)
*     console.log(`...and some markdown: ${result.content.text}`)
* })
* @see The [ClasseurClient]{@link module:classeur-api-client.ClasseurClient} class for API usage information.
* @see The [README](index.html) for an overview and more usage examples.
* @see The [source code]{@link https://github.com/zbentley/classeur-api-client} on GitHub.
* @see [classeur-downloader]{@link http://zbentley.github.io/classeur-downloader/versions/latest} for an example use case for this module.
* @module classeur-api-client
*/

const _ = require('lodash'),
    async = require('async'),
    flashheart = require('flashheart'),
    functionUtils = require('./lib/function-utils'),
    errors = require('./lib/errors'),
    util = require('util'),
    pkginfo = require('pkginfo')(module, 'name', 'version'),
    USER_AGENT = util.format(
        '%s/%s (%s)',
        module.exports.name,
        module.exports.version,
        flashheart.createClient().userAgent
    )

// const eyes = require('eyes'), p = eyes.inspect.bind(eyes)

/**
 * Constructs a new API client.
 * @static
 * @param {String} userId - Classeur user ID string.
 * @param {String} apiKey - API Key string. Keep this secret.
 * @param {String} [host=app.classeur.io] - Fully qualified hostname to connect to. Connections will be made with HTTPS, regardless of whether the hostname is prefixed with `http://` or `https://`.
 */
class ClasseurClient {
    constructor(userId, apiKey, host) {
        host = host || 'app.classeur.io'
        host.replace(/\Ahttps?:[/][/]/g, '')
        this._client = flashheart.createClient({  // Stored for dependency injection in testing.
            name: module.exports.name,
            userAgent: USER_AGENT,
            defaults: {
                auth: {
                    username: userId,
                    password: apiKey,
                }
            }
        })
        this.root = `https://${host}/api/`
    }

    /**
     * Retrieve one or more files.
     * @method
     * @param {...(String|String[])} &hellipids|&#91ids&#93 - An Array of strings, or multiple string arguments, each representing a Classeur file ID to retrieve.
     * - See {@tutorial Plural Functions} for more information on functions that can be called with an array or with variadic arguments.
     * - One REST call is made (in parallel) per ID supplied.
     * @param {module:classeur-api-client.ScrubbedCallback} callback - Called with `(error, result)`. See [ScrubbedCallback]{@link module:classeur-api-client.ScrubbedCallback} for more info.
     * - `result` will be an Array of [File]{@link module:classeur-api-client.File}  objects, or `null` on error.
     */
    getFiles() {
        functionUtils.restOrArrayAndCallback(function(array, cb) {
            async.map(
                array,
                (item, mcb) => { this.getFile(item, mcb) },
                functionUtils.scrubArrayCallback(cb, true, array.length)
            )
        }, this)(...arguments)
    }

    /**
     * Retrieve a single file.
     * @param {String} id - Classeur file ID to retrieve.
     * @param {module:classeur-api-client.ScrubbedCallback} callback - Called with `(error, result)`. See [ScrubbedCallback]{@link module:classeur-api-client.ScrubbedCallback} for more info.
     * - `result` will be a [File]{@link module:classeur-api-client.File} object, or `null` on error.
     */
    getFile(id, cb) {
        async.parallel(
            [
                (mcb) => { this.query('files/' + id, { v2: true }, mcb) },
                (mcb) => { this.query('files/' + id + '/contentRevs/last', { v2: true }, mcb) }
            ],
            functionUtils.scrubArrayCallback((err, result) => {
                if ( result ) {
                    let content = result[0], metadata = result[1]
                    if ( _.has(result[1], "text") ) {
                        content = result[1]
                        metadata = result[0]
                    }
                    metadata.content = content
                    result = metadata
                }
                // If content failed first, correct the error string so that
                // integration tests see the same thing consistently.
                else if ( err.reason === "content_is_not_readable" ) {
                    err.reason = "file_is_not_readable"
                }
                
                cb(err,result)
            }, true, 2)
        )
    }

    /**
     * Retrieve one or more folders.
     * @param {...(String|String[])} &hellipids|&#91ids&#93 - An Array of strings, or multiple string arguments, each representing a Classeur folder ID to retrieve.
     * - See {@tutorial Plural Functions} for more information on functions that can be called with an array or with variadic arguments.
     * - One REST call is made (in parallel) per ID supplied.
     * @param {module:classeur-api-client.ScrubbedCallback} callback - Called with `(error, result)`. See [ScrubbedCallback]{@link module:classeur-api-client.ScrubbedCallback} for more info.
     * - `result` will be an Array of [Folder]{@link module:classeur-api-client.Folder} objects, or `null` on error.
     */
    getFolders() {
        functionUtils.restOrArrayAndCallback(this.multiQuery, this)('folders/', true, ...arguments)
    }

    /**
     * Retrieve a single folder.
     * @param {String} id - Classeur folder ID to retrieve.
     * @param {module:classeur-api-client.ScrubbedCallback} callback - Called with `(error, result)`. See [ScrubbedCallback]{@link module:classeur-api-client.ScrubbedCallback} for more info.
     * - `result` will be a [Folder]{@link module:classeur-api-client.Folder} object, or `null` on error.
     */
    getFolder(id, cb) {
        functionUtils.singleElementAndCallback(this.multiQuery, this)('folders/', false, id, cb)
    }

    /**
     * Retrieve all users on the Classeur account to which the ClasseurClient is connected.
     * @param {module:classeur-api-client.ScrubbedCallback} callback - Called with `(error, result)`. See [ScrubbedCallback]{@link module:classeur-api-client.ScrubbedCallback} for more info.
     * - `result` will be an Array of [User]{@link module:classeur-api-client.User} objects, or `null` on error.
     */
    getUsers(cb) {
        this.query('users', {}, cb)
    }

    /**
     * Retrieve metadata for one or more users.
     * @param {...(String|String[])} &hellipids|&#91ids&#93 - An Array of strings, or multiple string arguments, each representing a Classeur user IDs for which to retrieve metadata.
     * - See {@tutorial Plural Functions} for more information on functions that can be called with an array or with variadic arguments.
     * @param {module:classeur-api-client.ScrubbedCallback} callback - Called with `(error, result)`. See [ScrubbedCallback]{@link module:classeur-api-client.ScrubbedCallback} for more info.
     * - `result` will be an Array of [UserMetadata]{@link module:classeur-api-client.UserMetadata} objects, or `null` on error.
     */
    getUsersMetadata() {
        functionUtils.restOrArrayAndCallback(this.multiMetadataQuery, this)('users', ...arguments)
    }

    /**
     * Retrieve metadata for one or more folders.
     * @param {...(String|String[])} &hellipids|&#91ids&#93 - An Array of strings, or multiple string arguments, each representing a Classeur folder IDs for which to retrieve metadata.
     * - See {@tutorial Plural Functions} for more information on functions that can be called with an array or with variadic arguments.
     * @param {module:classeur-api-client.ScrubbedCallback} callback - Called with `(error, result)`. See [ScrubbedCallback]{@link module:classeur-api-client.ScrubbedCallback} for more info.
     * - `result` will be an Array of [FolderMetadata]{@link module:classeur-api-client.FolderMetadata} objects, or `null` on error.
     */
    getFoldersMetadata() {
        functionUtils.restOrArrayAndCallback(this.multiMetadataQuery, this)('folders', ...arguments)
    }

    /**
     * Retrieve metadata for one or more files.
     * @param {...(String|String[])} &hellipids|&#91ids&#93 - An Array of strings, or multiple string arguments, each representing a Classeur file IDs for which to retrieve metadata.
     * - See {@tutorial Plural Functions} for more information on functions that can be called with an array or with variadic arguments.
     * @param {module:classeur-api-client.ScrubbedCallback} callback - Called with `(error, result)`. See [ScrubbedCallback]{@link module:classeur-api-client.ScrubbedCallback} for more info.
     * - `result` will be an Array of [FileMetadata]{@link module:classeur-api-client.FileMetadata} objects, or `null` on error.
     */
    getFilesMetadata() {
        functionUtils.restOrArrayAndCallback(this.multiMetadataQuery, this)('files', ...arguments)
    }

    /**
     * Retrieve metadata for a user.
     * @param {String} id - The Classeur user ID for which to retrieve metadata.
     * @param {module:classeur-api-client.ScrubbedCallback} callback - Called with `(error, result)`. See [ScrubbedCallback]{@link module:classeur-api-client.ScrubbedCallback} for more info.
     * - `result` will be a [UserMetadata]{@link module:classeur-api-client.UserMetadata} object, or `null` on error.
     */
    getUserMetadata(id, cb) {
        functionUtils.singleElementAndCallback(this.metadataQuery, this)('users', id, cb)
    }

    /**
     * Retrieve metadata for a file.
     * @param {String} id - The Classeur file ID for which to retrieve metadata.
     * @param {module:classeur-api-client.ScrubbedCallback} callback - Called with `(error, result)`. See [ScrubbedCallback]{@link module:classeur-api-client.ScrubbedCallback} for more info.
     * - `result` will be a [FileMetadata]{@link module:classeur-api-client.FileMetadata} object, or `null` on error.
     */
    getFileMetadata(id, cb) {
        functionUtils.singleElementAndCallback(this.metadataQuery, this)('files', id, cb)
    }

    /**
     * Retrieve metadata for a folder.
     * @param {String} id - The Classeur folder ID for which to retrieve metadata.
     * @param {module:classeur-api-client.ScrubbedCallback} callback - Called with `(error, result)`. See [ScrubbedCallback]{@link module:classeur-api-client.ScrubbedCallback} for more info.
     * - `result` will be a [FolderMetadata]{@link module:classeur-api-client.FolderMetadata} object, or `null` on error.
     */
    getFolderMetadata(id, cb) {
        functionUtils.singleElementAndCallback(this.metadataQuery, this)('folders', id, cb)
    }

    /** @private */
    multiMetadataQuery(field, ids, cb) {
        async.map(
            ids,
            _.partial(functionUtils.singleElementAndCallback(this.metadataQuery, this), field),
            functionUtils.scrubArrayCallback(cb, true, ids.length)
        )
    }

    metadataQuery(field, id, cb) {
        this.query(
            'metadata/' + field,
            {
                qs: { id: id },
                useQuerystring: true
            },
            (err,res) => {
                if ( _.isArrayLike(res) ) {
                    res = res[0]
                }
                cb(err,res)
            }
        )
    }

    multiQuery(type, wantArray, array, cb) {
        async.map(
            array,
            (item, cb) => { this.query(type + item, {}, cb) },
            functionUtils.scrubArrayCallback(cb, wantArray, array.length)
        )
    }

    query(path, args, cb) {
        const stem = this.root + ( args.v2 ? "v2/" : "v1/" )
        delete args.v2
        this._client.get(stem + path, args, (error, body, response) => {
            if ( error ) {
                if ( error.statusCode ) {
                    cb(new errors.ServerError(error, body, response), null)
                }
                else {
                    cb(new errors.ClientError(error, body, response, this._client.timeout), null)
                }
            }
            else {
                cb(null, body)
            }
        })
    }
    // Proxies for the error constructors so we don't have to add another module
    // to the package.
    static get ServerError() { return errors.ServerError }
    static get ClientError() { return errors.ClientError }
}

module.exports = ClasseurClient