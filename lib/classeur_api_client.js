var _ = require('lodash');
var async = require('async');
var rest = require('node-rest-client');
var sprintf = require('sprintf').sprintf;

function Connection(options) {
	this.client = new rest.Client({
		user: options.userId,
		password: options.apiKey,
	});

	options.host.replace(/\Ahttps?:[/][/]/g, '');
	this.root = 'https://' + options.host + '/api/v1/';
}

function query(path, args, cb) {

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

function argsToArray(func) {
	return _.modArgs(func, Array.of);
}

var simpleQuery = _.partial(query, _.partial.placeholder, {});

function multiQuery(type, array, cb) {
	async.map(
        array,
        _.modArgs(_.bind(simpleQuery, this), _.bind(String.prototype.concat, type)),
        cb
    );
}

function metadataQuery(field, ids, cb) {
	this.query('metadata/' + field, {
		parameters: {
			id: ids.join(),
		}
	}, cb);
}

var getUsersMetadata = _.partial(metadataQuery, 'users'),
	getFoldersMetadata = _.partial(metadataQuery, 'folders'),
	getFilesMetadata = _.partial(metadataQuery, 'files');

Connection.prototype = _.create(Connection.prototype, {
	constructor: Connection,
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
	getUserMetadata: argsToArray(getUsersMetadata),
	getFileMetadata: argsToArray(getFilesMetadata),
	getFolderMetadata: argsToArray(getFoldersMetadata),
});

module.exports = Connection;