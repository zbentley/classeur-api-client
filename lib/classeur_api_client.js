var _ = require('lodash');
var async = require('async');
var Client = require('node-rest-client').Client;
var sprintf = require('sprintf').sprintf;

function query(path, args, cb) {
<<<<<<< HEAD
    args.headers = {
        'x-agent-info': 'github.com/zbentley/classeur-api-client'
    };

    var req = this.client.get(this.root + path, args, function(data, response) {
        var code = response.statusCode;
        if ( code == 200 ) {
            cb(null, JSON.parse(data));
        } else {
            cb(sprintf('Got an error (%d): %s', code, response.statusMessage), null);
        }
    });

    req.on('requestTimeout',function(req){
        req.abort();
        cb('request expired', null);
    });

    req.on('responseTimeout', _.partial(cb, 'request timed out', null));
    req.on('error',  _.partialRight(cb, null));
}

function simpleQuery(type, item, cb) {
    _.bind(query, this, type + item, {}, cb)();
}

function multiQuery(type, array, cb) {
    async.map(
=======
	args.headers = {
		'x-agent-info': 'github.com/zbentley/classeur-api-client'
	};

	var req = this.client.get(this.root + path, args, function(data, response) {
		var code = response.statusCode;
		if ( code == 200 ) {
			cb(null, JSON.parse(data));
		} else {
			cb(sprintf('Got an error (%d): %s', code, response.statusMessage), null);
		}
	});

	req.on('requestTimeout',function(req){
		req.abort();
		cb('request expired', null);
	});

	req.on('responseTimeout', _.partial(cb, 'request timed out', null));
	req.on('error',  _.partialRight(cb, null));
}

function simpleQuery(type, item, cb) {
	_.bind(query, this, type + item, {}, cb)();
}

function multiQuery(type, array, cb) {
	async.map(
>>>>>>> ac6915a67788ce7c225fa898f3e05f4f5951d63a
        array,
        _.bind(simpleQuery, this, type),
        cb
    );
}

function metadataQuery(field, ids, cb) {
<<<<<<< HEAD
    _.bind(query, this, 'metadata/' + field, {
        parameters: {
            id: ids.join(","),
        }
    }, cb)();
}

var getUsersMetadata = _.partial(metadataQuery, 'users'),
    getFoldersMetadata = _.partial(metadataQuery, 'folders'),
    getFilesMetadata = _.partial(metadataQuery, 'files');

module.exports = function(options) {
    this.client = new Client({
        user: options.userId,
        password: options.apiKey,
    });

    options.host.replace(/\Ahttps?:[/][/]/g, '');
    this.root = sprintf('https://%s/api/v1/', options.host);
}

module.exports.prototype = _.create(module.exports.prototype, {
    constructor: module.exports,
    getFiles: _.partial(multiQuery, 'files/'),
    getFile: _.partial(simpleQuery, 'files/'),
    getFolders: _.partial(multiQuery, 'folders/'),
    getFolder: _.partial(simpleQuery, 'folders/'),
    getUsers: _.partial(simpleQuery, 'users'),
    // Metadata queries:
    getUsersMetadata: getUsersMetadata,
    getFoldersMetadata: getFoldersMetadata,
    getFilesMetadata: getFilesMetadata,
    // Functions that turn the first argument into a single-element array:
    getUserMetadata: _.modArgs(getUsersMetadata, Array.of),
    getFileMetadata: _.modArgs(getFilesMetadata, Array.of),
    getFolderMetadata: _.modArgs(getFoldersMetadata, Array.of),
=======
	_.bind(query, this, 'metadata/' + field, {
		parameters: {
			id: ids.join(","),
		}
	}, cb)();
}

var getUsersMetadata = _.partial(metadataQuery, 'users'),
	getFoldersMetadata = _.partial(metadataQuery, 'folders'),
	getFilesMetadata = _.partial(metadataQuery, 'files');

module.exports = function(options) {
	this.client = new Client({
		user: options.userId,
		password: options.apiKey,
	});

	options.host.replace(/\Ahttps?:[/][/]/g, '');
	this.root = sprintf('https://%s/api/v1/', options.host);
}

module.exports.prototype = _.create(module.exports.prototype, {
	constructor: module.exports,
	getFiles: _.partial(multiQuery, 'files/'),
	getFile: _.partial(simpleQuery, 'files/'),
	getFolders: _.partial(multiQuery, 'folders/'),
	getFolder: _.partial(simpleQuery, 'folders/'),
	getUsers: _.partial(simpleQuery, 'users'),
	// Metadata queries:
	getUsersMetadata: getUsersMetadata,
	getFoldersMetadata: getFoldersMetadata,
	getFilesMetadata: getFilesMetadata,
	// Functions that turn the first argument into a single-element array:
	getUserMetadata: _.modArgs(getUsersMetadata, Array.of),
	getFileMetadata: _.modArgs(getFilesMetadata, Array.of),
	getFolderMetadata: _.modArgs(getFoldersMetadata, Array.of),
>>>>>>> ac6915a67788ce7c225fa898f3e05f4f5951d63a
});