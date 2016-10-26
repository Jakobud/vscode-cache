# Visual Studio Code extension value caching

*This module is intended to be used only by Visual Studio Code extension authors. While it does not have any other module dependencies, it is only useful for developing VSCode extensions and serves no other real purpose outside the scope of Visual Studio Code extension development.*

---

The [VSCode API](https://code.visualstudio.com/docs/extensionAPI/vscode-api#_a-nameextensioncontextaspan-classcodeitem-id995extensioncontextspan) `ExtensionContext.globalState` object is a simple storage mechanism that extensions can use to save and retrieve values and objects persistently between VSCode sessions. `vscode-cache` is a interface wrapper around the `globalState` that makes it dead-simple for an extension author to manage cached items.

## Why would I want to use this in my VSCode extension?

This module is ideal when an extension needs to store dynamic data that it fetches from somewhere. For example if your extension fetches data from some REST API or from a database, it would be desirable to cache those results for some amount of time instead of making calls to the API or database over and over (especially if that 3rd party API charges you for each connection).

This module could also be very useful if an extension needs to store any type of values between VSCode sessions. For example if your extension takes in user-defined values via the `window.showInputBox()` method, maybe your extension would want to cache that value and use it again later.

You would also save values to a custom local file or something, but this is exactly why the `globalState` is there. `vscode-cache` simply abstracts that usage into an easier (and more powerful!) interface.

---

## Basic Usage

```
// First, get the module into your extension code
const Cache = require('vscode-cache');

// Extension activation method
let activate = (extensionContext) => {

  // Instantiate the cache by passing your `ExtensionContext` object into it
  let myCache = new Cache(extensionContext);

  // Save an item to the cache by specifying a key and value
  myCache.put('userName', 'John Doe')
    .then(() => {

      // Does the cache have userName?
      console.log(myCache.has('userName')); // returns true

      // Fetch the userName from the cache
      let userName = myCache.get('userName');

    });
};
```

## Optional expirations

You can optionally pass an expiration/lifetime (in seconds) for the cached item. If the current time is passed the expiration, then the cache no longer has it.

```
// Save something in the cache for 5 seconds
myCache.put('searchResults', results, 5)
  .then(()=> {

    // Does the cache still have it?
    console.log(myCache.has('searchResults')); // returns true

    // Does the cache still have it 10 seconds later?
    setTimeout(() => {

      console.log(myCache.has('searchResults')); // returns false

    }, 10000);
  });
```

## Default values

You can optionally specify a default value when fetching a cache item just in case it doesn't exist or is expired.

```
// Does the cache contain this value?
myCache.has('foo'); // returns false

// Fetch the value of foo, but give it a default value of "bar"
let foo = myCache.get('foo', 'bar');

console.log(foo); // returns bar
```

## Custom Namespaces

You can specify an optional namespace when instantiating your cache just in case you wanted more than one cache. This keeps them separate within the `globalState` object. The advantage of this is that you can use the same cache keys on different caches in order to store different values.

```
// Create a cache for some API
let apiCache = new Cache(extensionContext, 'api');

// Create some sort of database cache
let databaseCache = new Cache(extensionContext, 'database');

// Store a value into the api cache using the key 'foo'
apiCache.put('foo', apiResults);

// Store a different value into the database cache using the key 'foo'
databaseCache.put('foo', databaseResults);

// Because there are two caches, you can use the same keys in each without overriding values
```
