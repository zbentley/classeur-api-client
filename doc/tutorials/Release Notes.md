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