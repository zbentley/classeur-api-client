'use strict';

const _ = require('lodash'),
    expect = require('chai').expect,
    classes = require('../lib/errors'),
    ClasseurClient = require('../classeur-api-client');

// const eyes = require('eyes'), p = _.bind(eyes.inspect, eyes);

function testErrors(errors) {
    describe('ClientError', function() {
        it('Works with an Error object', function () {
            let param = new Error('foo');
            param.something = 'bar';
            const err = new errors.ClientError(param, 'a');
            expect(err).to.be.instanceof(Error);
            expect(err).to.be.instanceof(errors.ClientError);
            expect(err.message).to.be.equal('Client error: foo');
            expect(err.something).to.be.equal('bar');
        });
        it('Works with a useless object', function () {
            const err = new errors.ClientError('a', { foo: 1 });
            expect(err).to.be.instanceof(Error);
            expect(err).to.be.instanceof(errors.ClientError);
            expect(err.foo).to.equal(1);
            expect(err.message).to.equal('Client error: a');
        });
        it('Works with a useful object', function () {
            const err = new errors.ClientError('a', { message: 'foo', bar: 2 });
            expect(err).to.be.instanceof(Error);
            expect(err).to.be.instanceof(errors.ClientError);
            expect(err.bar).to.equal(2);
            expect(err.message).to.equal('Client error: a');
        });
        it('Works with a non-object', function () {
            const err = new errors.ClientError('a', 'b');
            expect(err).to.be.instanceof(Error);
            expect(err).to.be.instanceof(errors.ClientError);
            expect(err.message).to.equal('Client error: a');
        });
        it('Works with null', function () {
            const err = new errors.ClientError('a', null);
            expect(err).to.be.instanceof(Error);
            expect(err).to.be.instanceof(errors.ClientError);
            expect(err.message).to.equal('Client error: a'); // Default Error stringification.
        });
        it('Works with undefined', function () {
            const err = new errors.ClientError('a');
            expect(err).to.be.instanceof(Error);
            expect(err).to.be.instanceof(errors.ClientError);
            expect(err.message).to.equal('Client error: a');
        });
    });

    describe('ServerError', function() {
        it('Can construct with no response', function () {
            const err = new errors.ServerError('a','b');
            expect(err.response).to.be.undefined;
            expect(err.request).to.be.equal('a');
            expect(err.data).to.be.equal('b');
            expect(err.message).to.be.equal('Server error (undefined): undefined');
        });
        it('Can construct with non-object response', function () {
            const err = new errors.ServerError('a','b','c');
            expect(err.response).to.be.equal('c');
            expect(err.request).to.be.equal('a');
            expect(err.data).to.be.equal('b');
            expect(err.message).to.be.equal('Server error (undefined): undefined');
        });
        it('Can construct with useless object response', function () {
            const err = new errors.ServerError('a','b',{ foo: 1 });
            expect(err.response).to.be.deep.equal({ foo: 1 });
            expect(err.request).to.be.equal('a');
            expect(err.data).to.be.equal('b');
            expect(err.message).to.be.equal('Server error (undefined): undefined');
        });
        it('Can construct with useful object response', function () {
            const err = new errors.ServerError('a','b', { statusCode: 200, statusMessage: 'foo' });
            expect(err.response).to.be.deep.equal({ statusCode: 200, statusMessage: 'foo' });
            expect(err.request).to.be.equal('a');
            expect(err.data).to.be.equal('b');
            expect(err.message).to.be.equal('Server error (200): foo');
        });
    });
}

describe('Errors work properly when used directly', _.partial(testErrors, classes));
describe('Errors work properly when proxied through the main class', _.partial(testErrors, ClasseurClient));

