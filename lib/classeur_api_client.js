var _ = require('lodash');
var rest = require('node-rest-client');
var sprintf = require('sprintf').sprintf;

function Connection(options) {
	this.client = new rest.Client({
		user: options.userId,
		password: options.apiKey,
	});

	options.host.replace(/\Ahttps?:[/][/]/g, "");
	this.root = "https://" + options.host + "/api/v1/";

	this.client.registerMethod("getUsers", root + "users", "GET");
	this.client.registerMethod("getUsersMetadata", root + "/metadata/users", "GET");
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

function metadataQuery(field, ids, cb) {
	this.query("metadata/" + field, {
		parameters: {
			id: ids.join(),
		}
	}, cb);
}

Connection.prototype.getFolder = function(folderid, cb) {
	this.query("folders/" + folderid, {}, cb);
}

Connection.prototype.getFile = function(file, cb) {
	this.query("files/" + fileid, {}, cb);
}

Connection.prototype.getUsersMetadata = _.partial(metadataQuery, "users");

Connection.prototype.getFoldersMetadata = _.partial(metadataQuery, "folders");

Connection.prototype.getFilesMetadata = _.partial(metadataQuery, "files");


// Functions that turn the first argument into a single-element array:
Connection.prototype.getUserMetadata = _.modArgs(Connection.prototype.getUsersMetadata, Array.of);

Connection.prototype.getFileMetadata = _.modArgs(Connection.prototype.getFilesMetadata, Array.of);

Connection.prototype.getFolderMetadata = _.modArgs(Connection.prototype.getFoldersMetadata, Array.of);


Connection.prototype.getUsers = function(cb) {
	this.query("users", {}, cb);
}

exports.connect = function(options) {
	return new Connection(options);
}

exports.APIobjectToString = function(object, byID) {
	if ( object.id || object.name ) {
		return sprintf(
			"%s (%s)",
			byID ? object.id : object.name,
			byID ? object.name : object.id
		);
	} else {
		return "";
	}
}