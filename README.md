# classeur-api-client

Node.js client for the REST API of http://classeur.io/

[Classeur](http://classeur.io/) is an online writing and collaboration platform by the authors of [StackEdit](https://stackedit.io/). In addition to a web and desktop UI, it provides a read-only REST API. `classeur-api-client` is a simple object-oriented [Node.js](https://nodejs.org) library for interacting with that API.

**This is alpha software:** this is the first release of this client library. While I've done my best to write thorough unit and integration tests, there may be bugs, and the API is subject to change in future versions.

NPM package versions will follow [Semantic Versioning](http://semver.org/).

# API Documentation

API documentation is available at [http://zbentley.github.io/classeur-api-client/ClasseurClient.html](http://zbentley.github.io/classeur-api-client/ClasseurClient.html)

That documentation is generated via [JSDoc](http://usejsdoc.org/) information written alongside this module's code. Bugs or issues with the documentation should be reported in the same way as issues with the module's functionality.

# Installation

    npm install classeur-api-client

# Usage

### Note on IDs:

The REST API operates only by ID. You cannot get any information by human-visible name; you have to use the object IDs of files and folders to retrieve them using `classeur-api-client`. The IDs of files are visible in the URI bar of Classeur (if you are using Classeur in a browser). IDs of other objects, including files, are visible via the "properties" windows of those objects in the Classeur UI.

### Getting Started

This module provides an object-oriented interface to the Classeur API. Once it is installed, you should be able to to write:

    const ClasseurClient = require('classeur-api-client');
    const myClient = new ClasseurClient({ userId: "my id", apiKey: "my key" });

...and be up and running.

### Getting Files

For more information on method arguments, return types, etc., see the full [API Documentation](http://zbentley.github.io/classeur-api-client/latest/index.html#toc7__anchor).

`ClasseurClient#GetFile` can be used to retrieve single files:

    const fs = require('fs'),
	    myClient = new ClasseurClient({ userId: "my id", apiKey: "my key" });
	myClient.getFile("some file ID", function(error, result) {
		if ( error ) {
			console.log(`Oh no! Something went wrong: ${error}`);
		} else {
			console.log(`Saving file ${result.name}...`);
			fs.writeFile("/path/to/file.md", result.content.text, function(error, result) {
			...
			});
		}
	});

[`ClasseurClient#getFiles`](http://zbentley.github.io/classeur-api-client/latest/module-classeur-api-client-ClasseurClient.html#getFiles__anchor) or [`getFolders`](http://zbentley.github.io/classeur-api-client/latest/module-classeur-api-client-ClasseurClient.html#getFolders__anchor) can be used to get more than one file or folder at a time (at the cost of one API hit, done in parallel, per file):

	myClient.getFiles(["id1", "id2", ... ], function(error, results) {
		if ( error ) {
			console.log(`Oh no! Something went wrong: ${error}`);
		} else {
			results.forEach(function (result) {
				console.log(`Found file ${result.name} with ${result.content.text}`);
			});
		}
	});

`getFiles` and `getFolders` are multisignature functions, which means they can also be called with lists of parameters, e.g. `GetFiles("id1", "id2", ..., function(error, result) { ... })`. This does not depend on ES6 [rest parameters](https://nodejs.org/en/docs/es6/#which-features-are-behind-the-es_staging-flag). 

### Getting Metadata

Metadata getters (e.g. [getUserMetadata](http://zbentley.github.io/classeur-api-client/latest/module-classeur-api-client-ClasseurClient.html#getUserMetadata__anchor), or [getFoldersMetadata](http://zbentley.github.io/classeur-api-client/latest/module-classeur-api-client-ClasseurClient.html#getFoldersMetadata2__anchor)) work in much the same way as [`getFile`](http://zbentley.github.io/classeur-api-client/latest/module-classeur-api-client-ClasseurClient.html#getFile__anchor) and [`getFiles`](http://zbentley.github.io/classeur-api-client/latest/module-classeur-api-client-ClasseurClient.html#getFiles__anchor). There are single versions:

	myClient.getUserMetadata("some user id", function(error, result) {
		if ( error ) {
			console.log(`Oh no! Something went wrong: ${error}`);
		} else {
			console.log(`User id ${result.id}'s real name is ${result.name}`);
		}
	});

. . . and plural versions:

    myClient.getFilesMetadata(["file id 1", "file id 2" ... ], function(error, result) {
		if ( error ) {
			console.log(`Oh no! Something went wrong: ${error}`);
		} else {
			results.forEach(function (result) {
				console.log(`File ${result.name} was last updated at ${result.updated}`);
			});
		}
	});

# Making Changes

See the [Developer's Guide](doc/DeveloperGuide.md) for more info.

# Bugs

File a GitHub issue on the main repository.