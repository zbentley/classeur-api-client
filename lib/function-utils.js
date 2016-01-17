'use strict';

const _ = require('lodash'),
    expect = require('chai').expect,
    errors = require('./classeur-api-client/error');

// const eyes = require('eyes'), p = _.bind(eyes.inspect, eyes);

function oneFunctionArgWithLength(length, func) {
    expect(func).to.be.a('function');
    const fname = func.name;
    expect(func).to.have.length.of.at.least(length, `Wrapped function ${fname} must accept at least ${length} arguments`);
    return fname;
}

function argumentsWithCallback(arraylike, length, fname) {
    let args = _.toArray(arraylike);
    expect(args).to.have.length.of.at.least(length, `Function ${fname} called with ${args.length} arguments; requires at least ${length}`);
    expect(args[args.length - 1]).to.be.a('function', `Function ${fname} cannot be called without a callback as its final argument`);
    return args;
}

/**
 * Standard `function(error, result) { ... }` callbacks that get automatically wrapped so that either `error` or `result` must be `null`.
 * - **Write your callbacks like you normally would; they will be scrubbed automatically.** Code in scrubbed callbacks does not have to worry about cases in which both arguments passed to the callback will be non-`null`; at least one will always be `null` (callbacks that expect `null` as a result will still work).
 * @callback ScrubbedCallback
 * @memberof module:classeur-api-client
 * @param {?(Error)} error - An Error or error String, if an error occurred executing the function to which this callback was supplied, or `null` if the function was successful.
 * - All functions in this module will supply an instance of `Error` (or a subclass) to their callback; there is no need to check for String-type errors.
 * @param {?*} result - Result of the function to which this callback was supplied, or `null` if the function was unsuccessful.
 * - For type information of `result`, see the documentation for the function to which the callback was passed.
 * - `result` will be `null` even if the function was _partially_ successful, and was supposed to return an Array; partial result arrays are not supported.
 */

// The function that does the callback scrubbing.
module.exports.scrubArrayCallback = function(cb, wantarray) {
    return function(err, res) {
        if ( ! err ) {
            expect(res).to.be.instanceof(Array);
            res = _.compact(res);
            if ( res.length === 0 ) {
                err = err || new errors.ClientError(new Error('No results (should be 404, but API did not return an error)'));
            } else if ( ! wantarray ) {
                res = res[0];
            }
        }
        cb(err, err ? null : res);
    };
}

// Simulates function(a, b, c, ...args, cb), or function(a, b, c, [args], cb).
module.exports.restOrArrayAndCallback = function(wrapped, thisArg) {
    const fname = oneFunctionArgWithLength(2, wrapped);
    return function() {
        let args = argumentsWithCallback(arguments, 2, fname);
        // Assumes the last two are an array and a callback.
        const statics = args.splice(0, wrapped.length - 2),
            cb = args.pop();

        if ( ! ( args.length === 1 && _.isArray(args[0]) ) ) {
            args = [args];
        }

        _.bind(wrapped, thisArg)(...statics.concat(args, cb));
    };
}

// Asserts that a function only takes a single, non-array argument and a
// callback in addition to its other arguments.
module.exports.singleElementAndCallback = function(wrapped, thisArg) {
    const fname = oneFunctionArgWithLength(2, wrapped);
    return function() {
        let args = argumentsWithCallback(arguments, 2, fname);
        const idx = args.length - 2;
        expect(args[idx]).not.to.be.instanceof(Array, `Function ${fname} cannot be called with an array as the 2nd-to-last argument`);

        args[idx] = [args[idx]];
        _.bind(wrapped, thisArg)(...args);
    };
}
