'use strict';

const _ = require('lodash'),
    is = require('check-types').assert;



function oneFunctionArgWithLength(length, func) {
    is.function(func, `Expected a function, got ${typeof func} instead: ${func}`);
    const fname = func.name;
    is.greaterOrEqual(func.length, length, `Wrapped function ${fname} must accept at least ${length} arguments`);
    return fname;
}

function argumentsWithCallback(arraylike, length, fname) {
    let args = _.toArray(arraylike);
    is.greaterOrEqual(args.length, length, `Function ${fname} called with ${args.length} arguments; requires at least ${length}`);
    is.function(args[args.length - 1], `Function ${fname} cannot be called without a callback as its final argument`);
    return args;
}

/**
 * Sanitizes `function(error, result) { ... }` callbacks. Enforces that either `error` or `result` must be `null`.
 * @callback ClasseurClient~scrubbedCallback
 * @param {?(Error|String)} error - An Error or error String, if an error occurred executing the function to which this callback was supplied, or `null` if the function was successful.
 * @param {?*} result - Results of the function to which this callback was supplied, or `null` if the function was unsuccessful.
 * - `result` will be `null` even if the function was _partially_ successful, and was supposed to return an Array; partial result arrays are removed.
 */

module.exports.scrubArrayCallback = function(cb, wantarray) {
    return function(err, res) {
        if ( ! err ) {
            is.array(res, `Expected an array, got ${typeof res} instead: ${res}`);
            res = _.compact(res);
            if ( res.length === 0 ) {
                err = err || 'No results (should be 404, but API did not return an error)';
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
        is.not.array(args[idx], `Function ${fname} cannot be called with an array as the 2nd-to-last argument`);

        args[idx] = [args[idx]];
        _.spread(_.bind(wrapped, this))(args);
    };
}
