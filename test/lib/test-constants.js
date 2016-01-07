'use strict';

const fs = require('fs-extra'),
	fromFile = fs.readJsonSync('./integration-test-resources.json'));

module.exports = {
    CREDENTIALS: {
    	userId: fromFile.userId,
    	apiKey: fromFile.apiKey
   	},
    TEST_FILE: fromFile.existentFile,
    TEST_FOLDER: fromFile.existentFolder,
    FILE_CONTENT_PROPERTIES: ["text", "rev", "properties", "discussions"],
    FILE_PROPERTIES: ["id", "name", "permission", "userId", "updated",  "content"],
    FOLDER_FILES_PROPERTIES: ["id", "name", "updated", "userId"],
    FOLDER_PROPERTIES: ["files", "id", "name", "updated"],
    ERROR_STRING: "Got an error (400): Bad Request"
};