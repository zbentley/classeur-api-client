'use strict';

const _ = require('lodash'),
    ApiClient = require('../lib/classeur-api-client'),
    eyes = require('eyes'),
    fs = require('fs-extra'),
    p = _.bind(eyes.inspect, eyes),
    should = require('should'),
    CREDENTIALS = fs.readJsonSync(require('path').join(__dirname, 'private', 'integration-test-resources.json')),
    FILE_CONTENT_PROPERTIES = ["text", "rev", "properties", "discussions"],
    FILE_PROPERTIES = ["id", "name", "permission", "userId", "updated",  "content"],
    FOLDER_FILES_PROPERTIES = ["id", "name", "updated", "userId"],
    FOLDER_PROPERTIES = ["files", "id", "name", "updated"];

describe('constructor', function() {
    it('defaults host correctly', function () {
        let conn = new ApiClient(CREDENTIALS);
        conn.root.should.equal("https://app.classeur.io/api/v1/");
    });
});

const fileName = "Pc4hVJnOqQj0auke8eV6",
    folderName = "IFeJh0nJ1C6c6SVnRjH1";

function allFiles(array) {
    array.should.be.an.Array;
    _.each(array, function(elt) {
        elt.should.have.properties(FOLDER_FILES_PROPERTIES);
    });
}

describe('files', function() {
    let conn = new ApiClient(CREDENTIALS);
    describe('getFile', function() {
        it('returns file correctly', function (done) {
            conn.getFile(fileName, function(err, res) {
                should.not.exist(err);
                res.should.have.properties(FILE_PROPERTIES);
                res.content.should.have.properties(FILE_CONTENT_PROPERTIES);
                return done();
            });
        });
        it('handles nonexistent files correctly', function (done) {
            conn.getFile("nonexistent", function(err, res) {
                should.not.exist(res);
                err.should.equal("Got an error (400): Bad Request");
                return done();
            });
        });
    });
    describe('getFiles', function() {
        const testExistent = function(done) {
                return function(err, res) {
                    should.not.exist(err);
                    res.should.be.an.Array;
                    res.should.have.length(2);
                    res[0].should.deepEqual(res[1]);
                    res[0].should.have.properties(FILE_PROPERTIES);
                    res[0].content.should.have.properties(FILE_CONTENT_PROPERTIES);
                    return done();
                };
            },
            testNonexistent = function(done) {
                return function(err, res) {
                    should.not.exist(res);
                    err.should.equal("Got an error (400): Bad Request");
                    return done();
                };
            };
        it('returns files correctly (array mode)', function (done) {
            conn.getFiles([fileName, fileName], testExistent(done));
        });
        it('handles nonexistent files correctly (array mode)', function (done) {
             conn.getFiles([fileName, "nonexistent"], testNonexistent(done));
        });
        it('returns files correctly (list mode)', function (done) {
            conn.getFiles(fileName, fileName, testExistent(done));
        });
        it('handles nonexistent files correctly (list mode)', function (done) {
             conn.getFiles(fileName, "nonexistent", testNonexistent(done));
        });
    });
});

describe('folders', function() {
    let conn = new ApiClient(CREDENTIALS);
    describe('getFolder', function() {
        it('returns folder correctly', function (done) {
            conn.getFolder(folderName, function(err, res) {
                should.not.exist(err);
                res.should.have.properties(FOLDER_PROPERTIES);
                allFiles(res.files);
                return done();
            });
        });
        it('handles nonexistent folders correctly', function (done) {
            conn.getFolder("nonexistent", function(err, res) {
                should.not.exist(res);
                err.should.equal("Got an error (400): Bad Request");
                return done();
            });
        });
    });
    describe('getFolders', function() {
        const testExistent = function(done) {
                return function(err, res) {
                    should.not.exist(err);
                    res.should.be.an.Array;
                    res.should.have.length(2);
                    res[0].should.deepEqual(res[1]);
                    res[0].should.have.properties(FOLDER_PROPERTIES);
                    allFiles(res[0].files);
                    return done();
                };
            },
            testNonexistent = function(done) {
                return function(err, res) {
                    should.not.exist(res);
                    err.should.equal("Got an error (400): Bad Request");
                    return done();
                };
            };
        it('returns folders correctly (array mode)', function (done) {
            conn.getFolders([folderName, folderName], testExistent(done));
        });
        it('handles nonexistent folders correctly (array mode)', function (done) {
             conn.getFolders([folderName, "nonexistent"], testNonexistent(done));
        });
        it('returns folders correctly (list mode)', function (done) {
            conn.getFolders(folderName, folderName, testExistent(done));
        });
        it('handles nonexistent folders correctly (list mode)', function (done) {
             conn.getFolders(folderName, "nonexistent", testNonexistent(done));
        });
    });
});