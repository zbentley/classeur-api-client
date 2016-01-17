'use strict';

const grunt = require('grunt'),
    fromFile = grunt.file.readJSON(require('path').join(__dirname, 'private', 'integration-test-resources.json'));

module.exports = {
    credentials: {
        userId: fromFile.userId,
        apiKey: fromFile.apiKey
    },
    testFile: fromFile.existentFile,
    testFolder: fromFile.existentFolder,
    fileContentProperties: ['text', 'rev', 'properties', 'discussions'],
    fileProperties: ['id', 'name', 'permission', 'userId', 'updated',  'content'],
    folderFilesProperties: ['id', 'name', 'updated', 'userId'],
    folderProperties: ['files', 'id', 'name', 'updated'],
    nonexistentId: 'nonexistent000000000'
};