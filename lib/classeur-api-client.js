"use strict";

const _ = require('lodash'),
    async = require('async'),
    RestClient = require('node-rest-client').Client,
    functionUtils = require('./function-utils');

function query(path, args, cb) {
    args.headers = {
        'x-agent-info': 'github.com/zbentley/classeur-api-RestClient'
    };

    let req = this.RestClient.get(this.root + path, args, function(data, response) {
        const code = response.statusCode;
        if ( code == 200 ) {
            cb(null, JSON.parse(data));
        } else {
            cb(`Got an error (${code}): ${response.statusMessage}`, null);
        }
    });

    req.on('requestTimeout',function(req){
        req.abort();
        cb('request expired', null);
    });

    req.on('responseTimeout', _.partial(cb, 'request timed out', null));
    req.on('error',  _.partialRight(cb, null));
}

function multiQuery(type, wantarray, array, cb) {
    if ( ! wantarray ) {
        cb = _.modArgs(cb, _.identity, _.first);
    }
    const self = this;
    async.map(
        array,
        function(item,cb) {
            _.bind(query, self, type + item, {}, cb)();
        },
        cb
    );
}

function metadataQuery(field, ids, cb) {
    _.bind(query, this, 'metadata/' + field, {
        parameters: {
            id: ids.join(","),
        }
    }, cb)();
}

const getUsersMetadata = _.partial(metadataQuery, 'users'),
    getFoldersMetadata = _.partial(metadataQuery, 'folders'),
    getFilesMetadata = _.partial(metadataQuery, 'files');

module.exports = function(options) {
    // The _RestClient field facilitiates dependency injection in tests.
    this.RestClient = options._RestClient || new RestClient({
        user: options.userId,
        password: options.apiKey,
    });

    options.host.replace(/\Ahttps?:[/][/]/g, '');
    this.root = `https://${options.host}/api/v1/`;
}

module.exports.prototype = _.create(module.exports.prototype, {
    constructor: module.exports,
    getFiles: _.partial(functionUtils.restOrArrayAndCallback(multiQuery), 'files/', true),
    getFile: _.partial(functionUtils.singleElementAndCallback(multiQuery), 'files/', false),
    getFolders: _.partial(functionUtils.restOrArrayAndCallback(multiQuery), 'folders/', true),
    getFolder: _.partial(functionUtils.singleElementAndCallback(multiQuery), 'folders/', false),
    getUsers: _.partial(functionUtils.singleElementAndCallback(multiQuery), 'users', false),
    // Metadata queries:
    getUsersMetadata: getUsersMetadata,
    getFoldersMetadata: getFoldersMetadata,
    getFilesMetadata: getFilesMetadata,
    // Functions that turn the first argument into a single-element array:
    getUserMetadata: _.modArgs(getUsersMetadata, Array.of),
    getFileMetadata: _.modArgs(getFilesMetadata, Array.of),
    getFolderMetadata: _.modArgs(getFoldersMetadata, Array.of),
});