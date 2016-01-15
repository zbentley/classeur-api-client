'use strict';

const _ = require('lodash'),
    expect = require('chai').expect;

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
 * @callback ScrubbedCallback
 * @memberof module:classeur-api-client
 * @param {?(Error|String)} error - An Error or error String, if an error occurred executing the function to which this callback was supplied, or `null` if the function was successful.
 * @param {?*} result - Results of the function to which this callback was supplied, or `null` if the function was unsuccessful.
 * - `result` will be `null` even if the function was _partially_ successful, and was supposed to return an Array; partial result arrays are removed.
 */

module.exports.scrubArrayCallback = function(cb, wantarray) {
    return function(err, res) {
        if ( ! err ) {
            expect(res).to.be.instanceof(Array);
            res = _.compact(res);
            if ( res.length === 0 ) {
                err = err || new ClientError(new Error('No results (should be 404, but API did not return an error)'));
            } else if ( ! wantarray ) {
                res = res[0];
            }
        }
        cb(err, err ? null : res);
    };
}

// Simulates function(a, b, c, ...args, cb), or function(a, b, c, [args], cb).
module.exports.restOrArrayAndCallback = function(wrapped) {
    const fname = oneFunctionArgWithLength(2, wrapped);
    return function() {
        let args = argumentsWithCallback(arguments, 2, fname);
        // Assumes the last two are an array and a callback.
        const statics = args.splice(0, wrapped.length - 2),
            cb = args.pop();

        if ( ! ( args.length === 1 && _.isArray(args[0]) ) ) {
            args = [args];
        }

        _.spread(_.bind(wrapped, this))(statics.concat(args, cb));
    };
}

// Asserts that a function only takes a single, non-array argument and a
// callback in addition to its other arguments.
module.exports.singleElementAndCallback = function(wrapped) {
    const fname = oneFunctionArgWithLength(2, wrapped);
    return function() {
        let args = argumentsWithCallback(arguments, 2, fname);
        const idx = args.length - 2;
        expect(args[idx]).not.to.be.instanceof(Array, `Function ${fname} cannot be called with an array as the 2nd-to-last argument`);

        args[idx] = [args[idx]];
        _.spread(_.bind(wrapped, this))(args);
    };
}
