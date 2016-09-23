'use strict';

const _ = require('lodash'),
    constants = require('./test-constants.js'),
    STATUS_CODES = require('http').STATUS_CODES,
    SUCCESS = {
        statusCode: 200,
        headers: {
            'content-type': 'application/json; charset=utf-8'
        }
    };

// const eyes = require('eyes'), p = _.bind(eyes.inspect, eyes);

function hashify(array) {
    let props = {};
    _.each(array, function(prop) {
        props[prop] = true;
    });
    return props;
}

function stripIfStartsWith(str, target) {
    if ( _.startsWith(str, target) ) {
        return str.replace(target, '');
    } else {
        return false;
    }
}

class MockError extends Error {
    constructor(code, route, reason) {
        super(`Received HTTP code ${code} for GET ${route}`)
        this.statusCode = code
        this.body = {
            status: code,
            error: STATUS_CODES[code].toLowerCase(),
            reason: reason
        }
        this.headers = SUCCESS.headers
    }
}

module.exports = class MockRestClient {
    successfulResponse(array, overlay, cb) {
        let props = hashify(array)
        cb(null, _.merge(props, overlay), SUCCESS)
    }

    get(uri, opts, cb) {
        let id;
        uri = uri.replace(/.+?api[/]v1[/]/, '');

        if ( id = stripIfStartsWith(uri, 'files/') ) {
            if ( id === constants.testFile ) {
                const overlay = {
                    id: id,
                    content: hashify(constants.fileContentProperties)
                };
                this.successfulResponse(constants.fileProperties, overlay, cb);
            } else {
                cb(new MockError(403, uri, "file_is_not_readable"), null, null)
            }
        } else if ( id = stripIfStartsWith(uri, 'folders/') ) {
            if ( id === constants.testFolder ) {
                // TODO empty-vs-full folder tests here
                this.successfulResponse(constants.folderProperties, { id: id, files: [] }, cb);
            } else {
                cb(new MockError(403, uri, "folder_is_not_readable"), null, null)
            }
        } else if ( _.startsWith(uri, 'metadata/folders') ) {
            throw new Error('No tests for this function yet!');
        } else if ( _.startsWith(uri, 'metadata/files') ) {
            throw new Error('No tests for this function yet!');
        } else if ( _.startsWith(uri, 'metadata/users') ) {
            id = opts.qs.id[0]
            if ( id === constants.credentials.userId ) {
                cb(null, [{
                    id: id,
                    name: 'name'
                }], SUCCESS)
            } else {
                cb(new MockError(403, uri, "user_not_found"), null, null)
            }
        } else if ( _.startsWith(uri, 'users') ) {
            cb(null, [{
               id: constants.credentials.userId,
                name: 'name'
            }], SUCCESS)
        } else {
            throw new Error(`Unrecognized query: ${uri}, ${args}`);
        }
    };
};