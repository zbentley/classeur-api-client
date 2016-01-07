"use strict";

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

function multiQuery(type, wantarray, array, cb) {
    const self = this;

    async.map(
        array,
        function(item, cb) {
            _.bind(query, self, type + item, {}, cb)();
        },
        functionUtils.scrubArrayCallback(cb, wantarray)
    );
}

function metadataQuery(field, wantarray, ids, cb) {
    _.bind(query, this)(
        'metadata/' + field,
        {
            parameters: {
                id: ids.join(","),
            }
        },
        functionUtils.scrubArrayCallback(cb, wantarray)
    );
}

module.exports = function(options) {
    let host = options.host || "app.classeur.io";
    // The _InjectedRestClient field facilitiates dependency injection in tests.
    this.RestClient = options._InjectedRestClient || new RestClient({
        user: options.userId,
        password: options.apiKey,
    });

    host.replace(/\Ahttps?:[/][/]/g, '');
    this.root = `https://${host}/api/v1/`;
}

module.exports.prototype = _.create(module.exports.prototype, {
    constructor: module.exports,
    getFiles: _.partial(functionUtils.restOrArrayAndCallback(multiQuery), 'files/', true),
    getFile: _.partial(functionUtils.singleElementAndCallback(multiQuery), 'files/', false),
    getFolders: _.partial(functionUtils.restOrArrayAndCallback(multiQuery), 'folders/', true),
    getFolder: _.partial(functionUtils.singleElementAndCallback(multiQuery), 'folders/', false),
    // Metadata queries:
    getUsers: _.partial(functionUtils.singleElementAndCallback(multiQuery), 'users', true),
    getUsersMetadata: _.partial(functionUtils.restOrArrayAndCallback(metadataQuery), 'users', true),
    getFoldersMetadata: _.partial(functionUtils.restOrArrayAndCallback(metadataQuery), 'files', true),
    getFilesMetadata: _.partial(functionUtils.restOrArrayAndCallback(metadataQuery), 'folders', true),
    getUserMetadata: _.partial(functionUtils.singleElementAndCallback(metadataQuery), 'users', false),
    getFileMetadata: _.partial(functionUtils.singleElementAndCallback(metadataQuery), 'files', false),
    getFolderMetadata: _.partial(functionUtils.singleElementAndCallback(metadataQuery), 'folders', false),
});