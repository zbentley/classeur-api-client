# classeur-api-client

This is the documentation landing page for `classeur-api-client`, a node.js client for the REST API of [http://classeur.io/](http://classeur.io/).

Source code for this package is avaiable at [https://github.com/zbentley/classeur-api-client](https://github.com/zbentley/classeur-api-client).

Select a version of this library below to get started.

# Versions

NPM package versions will follow [Semantic Versioning](http://semver.org/).

Each link below will take you to the README for the given package version:

- [latest stable](<%- path %>versions/latest/index.html)
- [0.0.1](<%- path %>versions/0.0.1/index.html)
- [0.1.0](<%- path %>versions/0.1.1/index.html) (links to 0.1.1 documentation)
- [0.1.1](<%- path %>versions/0.1.1/index.html)
- [0.2.0](<%- path %>versions/0.2.0/index.html)
- [0.2.1](<%- path %>versions/0.2.1/index.html)
- [0.2.2](<%- path %>versions/0.2.2/index.html)
- [0.2.3](<%- path %>versions/0.2.3/index.html)
- [development/unstable (master)](<%- path %>versions/master/index.html)

# Release Notes

### 0.1.0
- Initial release.

### 0.1.1
- Documentation fixes.
- Added documentation build system.

### 0.2.0
- Fully automate documentation build system.
- Switch to [Restler](https://github.com/danwrong/restler) for HTTP interaction.
- Error behavior enhancements:
	- Handle JSON parsing/malformed-content errors.
	- Typed error objects are now returned from all HTTP interactions.
	- Add documentation for error behavior.
- Use Chai for type assertions at runtime rather than a separate library.
- Clean up code.
- Improve test coverage and accuracy.
- Update lodash dependency.
- Update documentation.

### 0.2.1
- Fix broken package manifest.

### 0.2.2
- Add stacktraces to errors.
- Fix minor bugs with handling of explicit 'undefined' results in callback result arrays.
- Minor documentation improvements.

### 0.2.3
- Make NodeJS 5/ES6 requirement explicit.
- Misc documentation fixes for readability.