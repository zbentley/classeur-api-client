'use strict';

const _ = require('lodash'),
    constants = require('./test-constants.js'),
    eyes = require('eyes'),
    p = _.bind(eyes.inspect, eyes),
    EventEmitter = require('events'),
    SUCCESS = {
        statusCode: 200,
        statusMessage: ''
    };

function hashify(array) {
    let props = {};
    _.each(array, function(prop) {
        props[prop] = true;
    });
    return props;
}

function successfulResponse(array, overlay, cb) {
    let props = hashify(array);
    _.merge(props, overlay);
    cb(JSON.stringify(props), SUCCESS);
}

function notFoundResponse(cb) {
    cb(null, {
        statusCode: 400,
        statusMessage: 'Bad Request'
    });
}

function stripIfStartsWith(str, target) {
    if ( _.startsWith(str, target) ) {
        return str.replace(target, '');
    } else {
        return false;
    }
}

function pending() {
    throw new Error('No tests for this function yet!');
}

module.exports = function(opts) {
    this.userId = opts.userId;
    this.apiKey = opts.apiKey;
};

module.exports.prototype.get = function(uri, opts, cb) {
    let id;
    uri = uri.replace(/.+?api[/]v1[/]/, '');

    if ( id = stripIfStartsWith(uri, 'files/') ) {
        if ( id === constants.testFile ) {
            const overlay = {
                id: id,
                content: hashify(constants.fileContentProperties)
            };
            successfulResponse(constants.fileProperties, overlay, cb);
        } else {
            notFoundResponse(cb);
        }
    } else if ( id = stripIfStartsWith(uri, 'folders/') ) {
        if ( id === constants.testFolder ) {
            successfulResponse(constants.folderProperties, { id: id }, cb);
        } else {
            notFoundResponse(cb);
        }
    } else if ( _.startsWith(uri, 'metadata/folders') ) {
        pending();
    } else if ( _.startsWith(uri, 'metadata/files') ) {
        pending();
    } else if ( _.startsWith(uri, 'metadata/users') ) {
        const ids = opts.parameters.id.split(',');
        let response;
        if ( _.uniq(ids).length === 1 && _.uniq(ids)[0] === constants.credentials.userId ) {
            response = _.map(ids, function(item) {
                return {
                    id: item,
                    name: 'name'
                };
            });
        } else {
            response = _.map(ids, function(item) {
                return { id: item };
            });
            // TODO uncomment the below when user-not-found works correctly
            // notFoundResponse(cb);
        }
        cb(JSON.stringify(response), SUCCESS);
    } else if ( _.startsWith(uri, 'users') ) {
        cb(JSON.stringify({
            id: constants.credentials.userId,
            name: 'name'
        }), SUCCESS);
    } else {
        throw new Error(`Unrecognized query: ${uri}, ${args}`);
    }
    return new EventEmitter();
};