var _ = require('lodash');
var async = require('async');
var rest = require('node-rest-client');
var sprintf = require('sprintf').sprintf;

function Connection(options) {
	this.client = new rest.Client({
		user: options.userId,
		password: options.apiKey,
	});

	options.host.replace(/\Ahttps?:[/][/]/g, "");
	this.root = "https://" + options.host + "/api/v1/";
}

Connection.prototype.query = function(path, args, cb) {

	args.headers = {
		"x-agent-info": "github.com/zbentley/classeur-api-client"
	};

	var req = this.client.get(this.root + path, args, function(data, response) {
		var code = response.statusCode;
		if ( code == 200 ) {
			cb(null, JSON.parse(data));
		} else {
			cb(sprintf("Got an error (%d): %s", code, response.statusMessage), null);
		}
	});

	req.on('requestTimeout',function(req){
		req.abort();
		cb("request expired", null);
	});
	 
	req.on('responseTimeout', _.partial(cb, "request timed out", null));
	req.on('error',  _.partialRight(cb, null));
}

function argsToArray(func) {
	return _.modArgs(func, Array.of);
}

var simpleQuery = Connection.prototype.simpleQuery = _.partial(Connection.prototype.query, _.partial.placeholder, {});

var multiQuery = Connection.prototype.multiQuery = function(type, array, cb) {
	async.map(
        array,
        _.modArgs(_.bind(simpleQuery, this), _.bind(String.prototype.concat, type)),
        cb
    );
}

var metadataQuery = Connection.prototype.metadataQuery = function(field, ids, cb) {
	this.query("metadata/" + field, {
		parameters: {
			id: ids.join(),
		}
	}, cb);
}

Connection.prototype.getFiles = _.partial(multiQuery, "files/");

Connection.prototype.getFolders = _.partial(multiQuery, "folders/");

Connection.prototype.getFolder = _.partial(simpleQuery, "folders/");

Connection.prototype.getUsers = _.partial(simpleQuery, "users");

Connection.prototype.getFile = _.partial(simpleQuery, "files/");

var getUsersMetadata = Connection.prototype.getUsersMetadata = _.partial(metadataQuery, "users");

var getFoldersMetadata = Connection.prototype.getFoldersMetadata = _.partial(metadataQuery, "folders");

var getFilesMetadata = Connection.prototype.getFilesMetadata = _.partial(metadataQuery, "files");

// Functions that turn the first argument into a single-element array:
Connection.prototype.getUserMetadata = argsToArray(getUsersMetadata);

Connection.prototype.getFileMetadata = argsToArray(getFilesMetadata);

Connection.prototype.getFolderMetadata = argsToArray(getFoldersMetadata);


module.exports = Connection;