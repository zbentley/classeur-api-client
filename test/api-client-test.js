'use strict';

const _ = require('lodash'),
    ApiClient = require('../lib/classeur-api-client'),
    eyes = require('eyes'),
    fs = require('fs-extra'),
    p = _.bind(eyes.inspect, eyes),
    expect = require('chai').expect;

// Testing constants:
const
    CREDENTIALS = fs.readJsonSync(require('path').join(__dirname, 'private', 'integration-test-resources.json')),
    TEST_FILE = CREDENTIALS.existentFile,
    TEST_FOLDER = CREDENTIALS.existentFolder,
    FILE_CONTENT_PROPERTIES = ["text", "rev", "properties", "discussions"],
    FILE_PROPERTIES = ["id", "name", "permission", "userId", "updated",  "content"],
    FOLDER_FILES_PROPERTIES = ["id", "name", "updated", "userId"],
    FOLDER_PROPERTIES = ["files", "id", "name", "updated"],
    ERROR_STRING = "Got an error (400): Bad Request";


function shouldHaveProperties(obj, props) {
    _.each(props, function(prop) {
        expect(obj).to.have.property(prop);
    });
}

function shouldAllBeFiles(array) {
    expect(array).to.be.an.Array;
    _.each(array, function(elt) {
        shouldHaveProperties(elt, FOLDER_FILES_PROPERTIES);
    });
}

function APIObjectShouldNotExist(func) {
    return function(done) {
        func(function(err, res){
            expect(res).to.not.exist;
            expect(err).to.equal(ERROR_STRING);
            done();
        });
    };
}

describe("integration tests", function(){
    let conn = new ApiClient(CREDENTIALS);
    this.slow(2000);
    this.timeout(10000);
    describe('constructor', function() {
        it('defaults host correctly', function () {
            expect(conn.root).to.equal("https://app.classeur.io/api/v1/");
        });
    });
    describe('getFile', function() {
        it('returns file correctly', function (done) {
            conn.getFile(TEST_FILE, function(err, res) {
                expect(err).to.not.exist;
                shouldHaveProperties(res, FILE_PROPERTIES);
                shouldHaveProperties(res.content, FILE_CONTENT_PROPERTIES);
                expect(res.id).to.equal(TEST_FILE);
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
                    expect(res[0].id).to.equal(TEST_FILE);
                    expect(res[0]).to.deep.equal(res[1]);
                    shouldHaveProperties(res[0], FILE_PROPERTIES);
                    shouldHaveProperties(res[0].content, FILE_CONTENT_PROPERTIES);
                    return done();
                };
            };
        it('returns files correctly (array mode)', function (done) {
            conn.getFiles([TEST_FILE, TEST_FILE], testExistent(done));
        });
        it('handles nonexistent files correctly (array mode)', APIObjectShouldNotExist(_.bind(conn.getFiles, conn, [TEST_FILE, "nonexistent"])));
        it('returns files correctly (list mode)', function (done) {
            conn.getFiles(TEST_FILE, TEST_FILE, testExistent(done));
        });
        it('handles nonexistent files correctly (list mode)', APIObjectShouldNotExist(_.bind(conn.getFiles, conn, TEST_FILE, "nonexistent")));
    });
    describe('getFolder', function() {
        it('returns folder correctly', function (done) {
            conn.getFolder(TEST_FOLDER, function(err, res) {
                expect(err).to.not.exist;
                shouldHaveProperties(res, FOLDER_PROPERTIES);
                shouldAllBeFiles(res.files);
                expect(res.id).to.equal(TEST_FOLDER);
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
                    shouldHaveProperties(res[0], FOLDER_PROPERTIES);
                    shouldAllBeFiles(res[0].files);
                    expect(res[0].id).to.equal(TEST_FOLDER);
                    return done();
                };
            };
        it('returns folders correctly (array mode)', function (done) {
            conn.getFolders([TEST_FOLDER, TEST_FOLDER], testExistent(done));
        });
        it('handles nonexistent folders correctly (array mode)', APIObjectShouldNotExist(_.bind(conn.getFolders, conn, [TEST_FOLDER, "nonexistent"])));
        it('returns folders correctly (list mode)', function (done) {
            conn.getFolders(TEST_FOLDER, TEST_FOLDER, testExistent(done));
        });
        it('handles nonexistent folders correctly (list mode)', APIObjectShouldNotExist(_.bind(conn.getFolders, conn, TEST_FOLDER, "nonexistent")));
    });
    describe('getUserMetadata', function() {
        it('returns user correctly', function (done) {
            conn.getUserMetadata(CREDENTIALS.userId, function(err, res) {
                expect(err).to.not.exist;
                shouldHaveProperties(res, ["id", "name"]);
                expect(res.id).to.equal(CREDENTIALS.userId);
                return done();
            });
        });
        // Skipping due to buggy "echo service"-like handling of bad metadata requests.
        it.skip('handles nonexistent users correctly', APIObjectShouldNotExist(_.bind(conn.getUserMetadata, conn, "nonexistent")));
    });
});
