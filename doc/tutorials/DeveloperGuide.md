# Developer's Guide

Pull requests are welcome! Pull the [source code](https://github.com/zbentley/classeur-api-client) and hack away.

## Unit Tests

To run unit tests, do `npm test` or `grunt test:unit`.

## Integration Tests

To run integration tests, that actually talk to the API, do the following:

1. Add information to `test/asset/private/integration-test-resources.json`.
	- In addition to your Classeur user ID and API key, add the ID of an existent file for `existentFile` and an existent folder _with at least one file in it_ to `existentFolder`.
2. Run the tests against the real API: `grunt test:integration`.
	- The tests are the same when run as unit tests or integration tests; the only difference is whether they run against a stubbed REST client or a real one.

## Documentation

### Building the Main Documentation

Documentation is generated, and, optionally, pushed to GitHub pages via a [grunt](gruntjs.com)-based build process. Generated documentation is placed in `doc/generated`. **The `doc/generated` folder will be removed and re-created as part of any documentation build.**

To generate documentation from the [JSDoc](http://usejsdoc.org/) in the code, do `grunt doc:master` or `grunt doc:current-version`. The names of the two functions are a bit deceptive: both will generate documentation from the branch and version of the module from which you are running `grunt`. The difference is that the former places the documentation into the `doc/generated/master` file, and the latter places it in the `doc/generated/$version` file, where `$version` is the NPM package version from `package.json`.

### Building the Version Index Documentation

`grunt doc:index` can be used to build just the documentation landing page, which contains links to multiple module versions' documentation. `grunt doc:index` is implied as part of all other `grunt doc` tasks.

The index will live in `doc/generated/index.html`. Unless you build a version's documentation in addition to the index, links in the index will not work.

### Pushing Documentation to GitHub Pages

You can add `:push` to either the `doc:master` or `doc:current-version` Grunt task to push the resulting documentation product to GitHub pages, e.g. `grunt doc:master:push`.

Before pushing, the build system will delete and re-create the index documentation (regardless of target), and documentation for the version-named (or `master`-named) folder you are targeting, depending on which Grunt task you're pushing with.

### Releasing New Versions

To get everything in sync with NPM and GitHub, do the following (I'll automate all/most of this away someday):

1. Code and test new release.
	- Be sure to remove or comment out uses of `eyes.js`, e.g. by searching for and commenting `require('eyes')`.
	- Be sure to revert any user API keys checked into the test assets in `test/asset/private`. The `addchanges.command` script can help with that.
2. Tag release with npm: `npm version major|minor|patch`.
3. Build, check and publish `master` documentation.
4. Build, check and publish `current-version` documentation.
5. Check out the pages branch (`git checkout gh-pages; git pull`) and update the symlink in `versions/latest` to point to the latest release. Push your changes.
6. Do `npm publish`. Wait a bit, and verify that everything is working/legible/visible.
7. Create a GitHub release, autogenerating a tag named after the new version, linking to the release notes on the "Other Versions" tutorial in GitHub pages.