'use strict';

const _ = require('lodash'),
    ApiClient = require('../lib/classeur-api-client'),
    eyes = require('eyes'),
    fs = require('fs-extra'),
    p = _.bind(eyes.inspect, eyes),
    should = require('should'),
    credentials = fs.readJsonSync(require('path').join(__dirname, 'credentials.json'));

describe('constructor', function() {
    it('defaults host correctly', function () {
        let conn = new ApiClient(credentials);
        conn.root.should.equal("https://app.classeur.io/api/v1/");
    });
});