'use strict'

const _ = require('lodash'),
    expect = require('chai').expect,
    classes = require('../lib/errors'),
    ClasseurClient = require('../classeur-api-client')

// const eyes = require('eyes'), p = _.bind(eyes.inspect, eyes)

function testErrors(errors) {
    describe('ClientError', function() {
        it('Works with an Error object', function () {
            let param = new Error('foo')
            param.something = 'bar'
            let err
            expect(() => {
                err = new errors.ClientError(param, { a: 'foo', something: 'fuzz' }, {q: 'quux'})
            }).not.to.throw(Error)
            expect(err).to.be.instanceof(Error)
            expect(err).to.be.instanceof(errors.ClientError)
            expect(err.message).to.equal('Client error: foo')
            // Tests overriding/overlay:
            expect(err.something).to.equal('bar')
            expect(err.a).to.equal('foo')
            expect(err.response.q).to.equal('quux')
            expect(err.data).to.deep.equal({ a: 'foo', something: 'fuzz' })
            expect(err.response).to.deep.equal({q: 'quux'})
        })

        it('Works with non-Error seed', function () {
            let err
            expect(() => {
                err = new errors.ClientError('buuuh', { a: 'foo', something: 'fuzz' }, {q: 'quux'})
            }).not.to.throw(Error)
            expect(err).to.be.instanceof(errors.ClientError)
            expect(err.message).to.equal('Client error: buuuh')
            // Tests overriding/overlay:
            expect(err.something).to.equal('fuzz')
            expect(err.a).to.equal('foo')
            expect(err.response.q).to.equal('quux')
        })

        it('Allows non-object body/data', function () {
            let err
            expect(() => {
                err = new errors.ClientError('buuuh', 'a', 'b')
            }).not.to.throw(Error)
            expect(err).to.be.instanceof(Error)
            expect(err).to.be.instanceof(errors.ClientError)
            expect(err.message).to.equal('Client error: buuuh')
            expect(err.data).to.equal('a')
            expect(err.response).to.equal('b')
        })

        it('rejects invalid input types', function () {
            let err
            expect(() => {
                err = new errors.ClientError({message: 'aaa'}, { a: 'foo', something: 'fuzz' }, {q: 'quux'})
            }).to.throw(Error)
        })
    })

    describe('ServerError', function() {
        it('Works with an Error object', function () {
            let param = new Error('foo')
            param.statusCode = 404
            param.something = 'bar'
            let err
            expect(() => {
                err = new errors.ClientError(param, { a: 'foo', something: 'fuzz' }, {q: 'quux'})
            }).not.to.throw(Error)
            expect(err).to.be.instanceof(Error)
            expect(err).to.be.instanceof(errors.ClientError)
            expect(err.message).to.equal('Client error: foo')
            // Tests overriding/overlay:
            expect(err.something).to.equal('bar')
            expect(err.a).to.equal('foo')
            expect(err.response.q).to.equal('quux')
            expect(err.data).to.deep.equal({ a: 'foo', something: 'fuzz' })
            expect(err.response).to.deep.equal({q: 'quux'})
        })

        it('Rejects invalid error values', function () {
            let err
            expect(() => {
                err = new errors.ServerError('buuuh', { a: 'foo', something: 'fuzz' }, {q: 'quux'})
            }).to.throw(Error)
            expect(() => {
                err = new errors.ServerError(new Error('buuuh'), { a: 'foo', something: 'fuzz' }, {q: 'quux'})
            }).to.throw(Error)
            expect(() => {
                err = new errors.ServerError({ message: 'foo', statusCode: 'bar' }, { a: 'foo', something: 'fuzz' }, {q: 'quux'})
            }).to.throw(Error)
        })

        it('Allows non-object body/data', function () {
            let err
            let param = new Error('buuuh')
            param.statusCode = 404
            expect(() => {
                err = new errors.ClientError(param, 'a', 'b')
            }).not.to.throw(Error)
            expect(err).to.be.instanceof(Error)
            expect(err).to.be.instanceof(errors.ClientError)
            expect(err.message).to.equal('Client error: buuuh')
            expect(err.data).to.equal('a')
            expect(err.response).to.equal('b')
        })

    })
}

describe('Errors work properly when used directly', _.partial(testErrors, classes))
describe('Errors work properly when proxied through the main class', _.partial(testErrors, ClasseurClient))

