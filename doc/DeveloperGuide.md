# Developer's Guide

Pull requests are welcome! Pull the [source code](https://github.com/zbentley/classeur-api-client) and hack away.

### Unit Tests

To run unit tests, do `npm test` or `grunt test:unit`.

### Integration Tests

To run integration tests, that actually talk to the API, do the following:

1. Add information to `test/asset/private/integration-test-resources.json`.
	- In addition to your Classeur user ID and API key, add the path to an existent file for `existentFile` and an existent folder _with at least one file in it_ to `existentFolder`.
	- `existentEmptyFolder` can be left alone; it is not yet used.

### Documentation

To generate documentation from the [JSDoc](http://usejsdoc.org/) in the code, do `grunt doc`.

Documentation will be placed in `doc/generated`. The folder will be removed and re-created as part of this process.