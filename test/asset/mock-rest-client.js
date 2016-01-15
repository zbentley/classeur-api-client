'use strict';

const _ = require('lodash'),
    constants = require('./test-constants.js'),
    EventEmitter = require('events'),
    SUCCESS = {
        statusCode: 200,
        statusMessage: ''
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

module.exports = class MockRestClient {
    constructor(opts) {
        this.parsers = {};
        this.aborted = false;
        this.userId = opts.userId;
        this.apiKey = opts.apiKey;
    }

    abort() {
        this.aborted =  true;
        this.deferredEmit('abort');
    }

    deferredEmit() {
        process.nextTick(_.bind(_.spread(this.emitter.emit), this.emitter, arguments));
    }

    notFoundResponse() {
        this.deferredEmit('fail', {
            statusCode: 400,
            statusMessage: 'Bad Request'
        }, {
            statusCode: 400,
            statusMessage: 'Bad Request'
        });
    }

    successfulResponse(array, overlay) {
        let props = hashify(array);
        _.merge(props, overlay);
        this.deferredEmit('success', props, SUCCESS);
    }

    get(uri, opts) {
        this.emitter = new EventEmitter();
        let id;
        uri = uri.replace(/.+?api[/]v1[/]/, '');

        if ( id = stripIfStartsWith(uri, 'files/') ) {
            if ( id === constants.testFile ) {
                const overlay = {
                    id: id,
                    content: hashify(constants.fileContentProperties)
                };
                this.successfulResponse(constants.fileProperties, overlay);
            } else {
                this.notFoundResponse();
            }
        } else if ( id = stripIfStartsWith(uri, 'folders/') ) {
            if ( id === constants.testFolder ) {
                // TODO empty-vs-full folder tests here
                this.successfulResponse(constants.folderProperties, { id: id, files: [] });
            } else {
                this.notFoundResponse();
            }
        } else if ( _.startsWith(uri, 'metadata/folders') ) {
            throw new Error('No tests for this function yet!');
        } else if ( _.startsWith(uri, 'metadata/files') ) {
            throw new Error('No tests for this function yet!');
        } else if ( _.startsWith(uri, 'metadata/users') ) {
            const ids = opts.query.id.split(',');
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
            this.deferredEmit('success', response, SUCCESS);
        } else if ( _.startsWith(uri, 'users') ) {
            this.deferredEmit('success', {
                id: constants.credentials.userId,
                name: 'name'
            }, SUCCESS);
        } else {
            throw new Error(`Unrecognized query: ${uri}, ${args}`);
        }
        return this.emitter;
    };
};