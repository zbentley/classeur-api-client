# Plural Functions

In this module, there are several functions that operate over multiple things. For example, [getFiles](http://zbentley.github.io/classeur-api-client/versions/latest/module-classeur-api-client.ClasseurClient.html#getFiles__anchor) operates over multiple file IDs, and [getUsersMetadata](http://zbentley.github.io/classeur-api-client/versions/latest/module-classeur-api-client.ClasseurClient.html#getUsersMetadata__anchor) operates over multiple user IDs and metadata objects.

Each such function can be called in one of two ways: with an array of things to operate on, or with a list of arguments. I call these 'Plural Functions'.

Calling a function with one or the other signature does not affect its internal behavior or its return types in any way. Callbacks that expect an array of results will still receive that array, regardless of the signature used for the function to which a callback is passed.

If you don't need to operate on multiple things, all plural functions have a single version, named without the plural (e.g. [getFile](http://zbentley.github.io/classeur-api-client/versions/latest/module-classeur-api-client.ClasseurClient.html#getFile__anchor) is the singular version of [getFiles](http://zbentley.github.io/classeur-api-client/versions/latest/module-classeur-api-client.ClasseurClient.html#getFiles__anchor), [getUserMetadata](http://zbentley.github.io/classeur-api-client/versions/latest/module-classeur-api-client.ClasseurClient.html#getUsersMetadata__anchor) is the singular version of [getUsersMetadata](http://zbentley.github.io/classeur-api-client/versions/latest/module-classeur-api-client.ClasseurClient.html#getUserMetadata__anchor), etc.). The singular versions don't return arrays to their callbacks; they just return the single JSON object corresponding to the supplied ID.

### Examples

[getFolders](http://zbentley.github.io/classeur-api-client/versions/latest/module-classeur-api-client.ClasseurClient.html#getFolders__anchor) is a plural function. It has two signatures:

1. One with arrays of IDs:
```javascript
getFolders(new Array(id1, id2, ...), function(error, results) { ... })
```

2. ...and one with variadic IDs, `...ids`:
```javascript
getFolders(id1, id2, ..., function(error, results) { ... })
```

It can be called like this:

```javascript
// new Array('folder id 1', 'folder id 2', 'folder id 3'), Array.of, or any other constructor would work just as well.
clientInstance.getFolders(['folder id 1', 'folder id 2', 'folder id 3'], (error, results) => {
	if ( error ) console.log(`Got an error: ${error}`);
	if ( results ) results.forEach((result) => { console.log(`Got a result: ${result}`)});
})
```

...or like this:

```javascript
clientInstance.getFolders('folder id 1', 'folder id 2', 'folder id 3', (error, results) => {
	if ( error ) console.log(`Got an error: ${error}`);
	if ( results ) results.forEach((result) => { console.log(`Got a result: ${result}`)});
})
```

Both snippets do exactly the same thing.

The above examples use ES6 [arrow functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions) and [template strings](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/template_strings). Follow those links if either syntax is unfamiliar to you.

### Why?

Functions on a general-purpose, public API should follow the 'don't make me think' school of usability design.

While (in my impression) conventions for various projects/frameworks/environments lean in favor of passing Arrays of arguments to functions rather than variadic argument sections, that convention is far from universal (and the introduction of [rest parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters) makes it poteltially likely to change).

APIs and utility code in general should not dictate coding style more than absolutely necessary. It should document behavior as clearly as possible, and then get out of the way and let users code in whatever style is most familiar and useful to them. When you import a new module, read the manual, and start writing code, the last thing you want is to write a function call and then stop, scratch your head, and wonder 'does this take an array or an argument list?' Even if the documentation (or failure of tests) clearly indicates one or the other, the very act of stopping development, wondering if something is correct, and then getting sidetracked while you research or test your assumption functions a lot like a hardware interrupt; it's something that should be avoided if possible. Developers have only so much time and cognitive bandwidth; why waste it worrying on which of several equally-semantically-sensible call syntaxes to use when the answer can be 'whatever you want' without loss of functionality?

### Does this require [ES6 Rest Parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters)?

No. It just simulates them. Once rest parameters are more widely supported, that might change.

As of this writing, [rest parameters are not enabled in NodeJS by default without additional flags](https://nodejs.org/en/docs/es6/#which-features-are-behind-the-es_staging-flag).