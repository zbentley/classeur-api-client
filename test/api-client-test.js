'use strict';

const _ = require('lodash'),
	ApiClient = require('../lib/classeur-api-client'),
	eyes = require('eyes'),
	fs = require('fs-extra'),
	p = _.bind(eyes.inspect, eyes),
	pathJoin = require('path').join,
	should = require('should'),
	credentials = fs.readJsonSync(pathJoin(__dirname, 'credentials.json'));


p(credentials);