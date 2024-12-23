# Visual Studio Code extension value caching

_This module is intended to be used only by Visual Studio Code extension authors. While it does not have any other
module dependencies, it is only useful for developing VSCode extensions and serves no other real purpose outside the
scope of Visual Studio Code extension development._

---

`vscode-cache` is an abstraction of the [VSCode
API](https://code.visualstudio.com/docs/extensionAPI/vscode-api#_a-nameextensioncontextaspan-classcodeitem-id995extensioncontextspan)
`ExtensionContext.globalState` interface.
The `globalState` object is a simple storage mechanism that extensions can use to store and retrieve values and objects
persistently (even between VSCode sessions). `vscode-cache` is a simple and powerful interface that wraps the
`globalState` object, adding functionality, like optional expirations, key existence checking, default values, etc.

## Why would I want to use this in my VSCode extension?

This module is ideal for extensions to store arbitrary data for long or short term. Some examples:

- Cache data that your extension got from some database instead of unnecessarily hitting that database server each time
- Cache results from that 3rd party REST API that costs money for each connection
- Save user input that your extension aquired via the `vscode.window.showInputBox()` or `vscode.window.showQuickPick()`
methods

---

## Installation

Install into your VSCode Extension project

```
# npm install vscode-cache --save
```

## Basic Usage

```javascript
// First, get the module into your extension code
import Cache from 'vscode-cache';

// Extension activation method
let activate = (extensionContext) => {

// Instantiate the cache by passing the VSCode `ExtensionContext` object into it
let myCache = new Cache(extensionContext);

// Save an item to the cache by specifying a key and value
myCache.put('userName', 'John Doe');

// Check for existence
console.log(myCache.has('userName')); // returns true

// Fetch the userName from the cache
let userName = myCache.get('userName'); // 'John Doe'
};
```

After creating your cache, any values you put into it will persist between VSCode sessions.

## Optional expirations

You can optionally pass an expiration/lifetime for the cached item. If the current time is passed the expiration, then
the cache no longer has it.

```javascript
// Save something in the cache that will expire in 5 seconds
myCache.put('searchResults', results, 5000);

// Does the cache still have it?
console.log(myCache.has('searchResults')); // returns true

// 10 seconds later, does the cache still have it?
setTimeout(() => {
  console.log(myCache.has('searchResults')); // returns false
  let searchResults = cache.get('searchResults'); // returns undefined
}, 10000);

// You can also set expirations after the fact:

// Add a relative expiration in milliseconds
// (expires 10 seconds from now)
myCache.setExpiration('someValue', 10000);

// Alternatively set an absolute expiration time in milliseconds
// (expires December 25, 2050, 12:00:00 PM GMT)
myCache.setAbsoluteExpiration('someValue', 2555582400000);

// Check if something is expired
if (myCache.isExpired('someValue')) { // returns false
  ...
}
```

## Default values

You can optionally specify a default value when fetching a cache item just in case it doesn't exist or is expired.

```javascript
// Does the cache contain this value?
console.log(myCache.has('foo')); // returns false

// Fetch the value of foo, but give it a default value of "bar"
let foo = myCache.get('foo', 'bar');

console.log(foo); // returns bar
```

## Multiple Caches & Custom Namespaces

You can create multiple caches that are stored in the VSCode `globalState` object by using custom namespaces when
instantiating your cache. Advantages of this is that you can use the same cache keys on different caches and so you can
delete one cache without affecting the other.

```javascript
// Create a cache for some API
let apiCache = new Cache(extensionContext, 'api');

// Create some sort of database cache
let databaseCache = new Cache(extensionContext, 'database');

// Store a value into the api cache using the key 'foo'
apiCache.put('foo', apiResults);

// Store a different value into the database cache using the key 'foo'
databaseCache.put('foo', databaseResults);

// Flush (Delete) the api cache's contents without affecting the database cache
apiCache.flush();
```

## Chainable methods

Some of the cache methods can be chained together.

```javascript
let myCache = new Cache(extensionContext);

// Chain multiple actions together
myCache.put('name', 'John Doe').put('city', 'Denver').put('state', 'Colorado');

// Chain some more actions together
myCache.forget('state').put('gender', 'male');
```

{{>main}}