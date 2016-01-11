'use strict';

const _ = require('lodash'),
    ApiClient = require('../lib/classeur-api-client'),
    MockRestClient = require('./lib/mock-rest-client.js'),
    eyes = require('eyes'),
    p = _.bind(eyes.inspect, eyes),
    expect = require('chai').expect,
    constants = require('./lib/test-constants.js');

// Nasty global interaction as a way to get flags into the Mocha tests. It could
// just as easily use environment variables.
const TEST_TYPE = global._ZB_INTEGRATION_TEST ? 'integration' : 'unit';
delete global._ZB_INTEGRATION_TEST;

function shouldHaveProperties(obj, props) {
    _.each(props, function(prop) {
        expect(obj).to.have.property(prop);
    });
}

function shouldAllBeFiles(array) {
    expect(array).to.be.an.Array;
    _.each(array, function(elt) {
        shouldHaveProperties(elt, constants.folderFilesProperties);
    });
}

function APIObjectShouldNotExist(func) {
    return function(done) {
        func(function(err, res){
            expect(res).to.not.exist;
            expect(err).to.equal(constants.errorString);
            done();
        });
    };
}

describe(`${TEST_TYPE} tests`, function() {
    let conn = new ApiClient(constants.credentials.userId, constants.credentials.apiKey);

    if ( TEST_TYPE === 'integration' ) {
        this.slow(2000);
        this.timeout(10000);
    } else {
        conn.RestClient = new MockRestClient(constants.credentials);
    }

    describe('constructor', function() {
        it('defaults host correctly', function () {
            expect(conn.root).to.equal("https://app.classeur.io/api/v1/");
        });
    });
    describe('getFile', function() {
        it('returns file correctly', function (done) {
            conn.getFile(constants.testFile, function(err, res) {
                expect(err).to.not.exist;
                shouldHaveProperties(res, constants.fileProperties);
                shouldHaveProperties(res.content, constants.fileContentProperties);
                expect(res.id).to.equal(constants.testFile);
                return done();
            });
        });
        it('handles nonexistent files correctly', APIObjectShouldNotExist(_.bind(conn.getFile, conn, "nonexistent")));
    });
    describe('getFiles', function() {
        const testExistent = function(done) {
                return function(err, res) {
                    expect(err).to.not.exist;
                    expect(res).to.be.an.Array;
                    expect(res).to.have.length(2);
                    expect(res[0].id).to.equal(constants.testFile);
                    expect(res[0]).to.deep.equal(res[1]);
                    shouldHaveProperties(res[0], constants.fileProperties);
                    shouldHaveProperties(res[0].content, constants.fileContentProperties);
                    return done();
                };
            };
        it('returns files correctly (array mode)', function (done) {
            conn.getFiles([constants.testFile, constants.testFile], testExistent(done));
        });
        it('handles nonexistent files correctly (array mode)', APIObjectShouldNotExist(_.bind(conn.getFiles, conn, [constants.testFile, "nonexistent"])));
        it('returns files correctly (list mode)', function (done) {
            conn.getFiles(constants.testFile, constants.testFile, testExistent(done));
        });
        it('handles nonexistent files correctly (list mode)', APIObjectShouldNotExist(_.bind(conn.getFiles, conn, constants.testFile, "nonexistent")));
    });
    describe('getFolder', function() {
        it('returns folder correctly', function (done) {
            conn.getFolder(constants.testFolder, function(err, res) {
                expect(err).to.not.exist;
                shouldHaveProperties(res, constants.folderProperties);
                shouldAllBeFiles(res.files);
                expect(res.id).to.equal(constants.testFolder);
                return done();
            });
        });
        it('handles nonexistent folders correctly ', APIObjectShouldNotExist(_.bind(conn.getFolder, conn, "nonexistent")));
    });

    describe('getFolders', function() {
        const testExistent = function(done) {
                return function(err, res) {
                    expect(err).to.not.exist;
                    expect(res).to.be.an.Array;
                    expect(res).to.have.length(2);
                    expect(res[0]).to.deep.equal(res[1]);
                    shouldHaveProperties(res[0], constants.folderProperties);
                    shouldAllBeFiles(res[0].files);
                    expect(res[0].id).to.equal(constants.testFolder);
                    return done();
                };
            };
        it('returns folders correctly (array mode)', function (done) {
            conn.getFolders([constants.testFolder, constants.testFolder], testExistent(done));
        });
        it('handles nonexistent folders correctly (array mode)', APIObjectShouldNotExist(_.bind(conn.getFolders, conn, [constants.testFolder, "nonexistent"])));
        it('returns folders correctly (list mode)', function (done) {
            conn.getFolders(constants.testFolder, constants.testFolder, testExistent(done));
        });
        it('handles nonexistent folders correctly (list mode)', APIObjectShouldNotExist(_.bind(conn.getFolders, conn, constants.testFolder, "nonexistent")));
    });
    describe('getUserMetadata', function() {
        it('returns user correctly', function (done) {
            conn.getUserMetadata(constants.credentials.userId, function(err, res) {
                expect(err).to.not.exist;
                shouldHaveProperties(res, ["id", "name"]);
                expect(res.id).to.equal(constants.credentials.userId);
                return done();
            });
        });
        // Skipping due to buggy "echo service"-like handling of bad metadata requests.
        it.skip('handles nonexistent users correctly', APIObjectShouldNotExist(_.bind(conn.getUserMetadata, conn, "nonexistent")));
    });
    describe('getUsersMetadata', function() {
        it('returns users correctly', function (done) {
            conn.getUsersMetadata(constants.credentials.userId, constants.credentials.userId, function(err, res) {
                expect(err).to.not.exist;
                expect(res).to.be.an.Array;
                shouldHaveProperties(res[0], ["id", "name"]);
                expect(res[0]).to.deep.equal(res[1]);
                expect(res[0].id).to.equal(constants.credentials.userId);
                return done();
            });
        });
        // Skipping due to buggy "echo service"-like handling of bad metadata requests.
        it.skip('handles nonexistent users correctly', APIObjectShouldNotExist(_.bind(conn.getUsersMetadata, conn, constants.credentials.userId, "nonexistent")));
    });
    describe('getUsers', function() {
        it('returns users correctly', function (done) {
            conn.getUsers(function(err, res) {
                if ( conn.RestClient instanceof MockRestClient ) {
                    expect(err).to.not.exist;
                    expect(res).to.be.an.Array;
                    shouldHaveProperties(res[0], ["id", "name"]);
                    expect(res[0].id).to.equal(constants.credentials.userId);
                } else {
                    // TODO get admin permissions so this can be tested.
                    expect(err).to.equal("Got an error (403): Forbidden");
                }
                return done();
            });
        });
    });
});

