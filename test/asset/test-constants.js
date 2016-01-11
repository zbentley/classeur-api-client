'use strict';

const fs = require('fs-extra'),
    fromFile = fs.readJsonSync(require('path').join(__dirname, 'private', 'integration-test-resources.json'));

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
    errorString: 'Got an error (400): Bad Request'
};