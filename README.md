# Visual Studio Code extension value caching

*This module is intended to be used only by Visual Studio Code extension authors. While it does not have any other module dependencies, it is only useful for developing VSCode extensions and serves no other real purpose outside the scope of Visual Studio Code extension development.*

---

`vscode-cache` is an abstraction of the [VSCode API](https://code.visualstudio.com/docs/extensionAPI/vscode-api#_a-nameextensioncontextaspan-classcodeitem-id995extensioncontextspan) `ExtensionContext.globalState` interface.
The `globalState` object is a simple storage mechanism that extensions can use to save and retrieve values and objects persistently (even between VSCode sessions). `vscode-cache` is a simple and powerful interface that wraps the `globalState` object, adding expirations, existence checking, etc.

## Why would I want to use this in my VSCode extension?

This module is ideal for extensions to store arbitrary data for long or short term. Some examples:

- Cache data that you grabbed from some database instead of hitting that database server each time
- Cache results from that 3rd party REST API that charges you for each connection
- Save user input that you aquired via the `vscode.window.showInputBox()` or `vscode.window.showQuickPick()` methods

---

## Installation
```
# npm install vscode-cache --save
```

## Basic Usage

```javascript
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

```javascript
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

```javascript
// Does the cache contain this value?
myCache.has('foo'); // returns false

// Fetch the value of foo, but give it a default value of "bar"
let foo = myCache.get('foo', 'bar');

console.log(foo); // returns bar
```

## Custom Namespaces

You can specify an optional namespace when instantiating your cache just in case you wanted more than one cache. This keeps them separate within the `globalState` object. The advantage of this is that you can use the same cache keys on different caches in order to store different values.

```javascript
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

<a name="Cache"></a>

## Cache
**Kind**: global class  

* [Cache](#Cache)
    * [new Cache(context, [namespace])](#new_Cache_new)
    * [.put(key, value, [expiration])](#Cache+put) ⇒ <code>Thenable</code>
    * [.get(key, [defaultValue])](#Cache+get) ⇒ <code>any</code>
    * [.has(key)](#Cache+has) ⇒ <code>boolean</code>
    * [.forget(key)](#Cache+forget) ⇒ <code>Thenable</code> &#124; <code>false</code>
    * [.keys()](#Cache+keys) ⇒ <code>Array.&lt;string&gt;</code>
    * [.all()](#Cache+all) ⇒ <code>object</code>
    * [.flush()](#Cache+flush) ⇒ <code>Thenable</code>
    * [.expiration(key)](#Cache+expiration) ⇒ <code>number</code>
    * [.isExpired(item)](#Cache+isExpired) ⇒ <code>boolean</code>


* * *

<a name="new_Cache_new"></a>

### new Cache(context, [namespace])
A module for use in developing a Visual Studio Code extension. It allows an extension to cache values across sessions with optional expiration times using the ExtensionContext.globalState.

**Returns**: <code>[Cache](#Cache)</code> - The cache object  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>context</td><td><code>vscode.ExtensionContext</code></td><td><p>The Visual Studio Code extension context</p>
</td>
    </tr><tr>
    <td>[namespace]</td><td><code>string</code></td><td><p>Optional namespace for cached items. Defaults to &quot;cache&quot;</p>
</td>
    </tr>  </tbody>
</table>


* * *

<a name="Cache+put"></a>

### cache.put(key, value, [expiration]) ⇒ <code>Thenable</code>
Store an item in the cache, with optional expiration

**Kind**: instance method of <code>[Cache](#Cache)</code>  
**Returns**: <code>Thenable</code> - Visual Studio Code Thenable (Promise)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>key</td><td><code>string</code></td><td><p>The unique key for the cached item</p>
</td>
    </tr><tr>
    <td>value</td><td><code>any</code></td><td><p>The value to cache</p>
</td>
    </tr><tr>
    <td>[expiration]</td><td><code>number</code></td><td><p>Optional expiration time in seconds</p>
</td>
    </tr>  </tbody>
</table>


* * *

<a name="Cache+get"></a>

### cache.get(key, [defaultValue]) ⇒ <code>any</code>
Get an item from the cache, or the optional default value

**Kind**: instance method of <code>[Cache](#Cache)</code>  
**Returns**: <code>any</code> - Returns the cached value or optional defaultValue  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>key</td><td><code>string</code></td><td><p>The unique key for the cached item</p>
</td>
    </tr><tr>
    <td>[defaultValue]</td><td><code>any</code></td><td><p>The optional default value to return if the cached item does not exist or is expired</p>
</td>
    </tr>  </tbody>
</table>


* * *

<a name="Cache+has"></a>

### cache.has(key) ⇒ <code>boolean</code>
Checks to see if unexpired item exists in the cache

**Kind**: instance method of <code>[Cache](#Cache)</code>  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>key</td><td><code>string</code></td><td><p>The unique key for the cached item</p>
</td>
    </tr>  </tbody>
</table>


* * *

<a name="Cache+forget"></a>

### cache.forget(key) ⇒ <code>Thenable</code> &#124; <code>false</code>
Removes an item from the cache

**Kind**: instance method of <code>[Cache](#Cache)</code>  
**Returns**: <code>Thenable</code> &#124; <code>false</code> - Visual Studio Code Thenable (Promise) or false if key does not exist  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>key</td><td><code>string</code></td><td><p>The unique key for the cached item</p>
</td>
    </tr>  </tbody>
</table>


* * *

<a name="Cache+keys"></a>

### cache.keys() ⇒ <code>Array.&lt;string&gt;</code>
Get an array of all cached item keys

**Kind**: instance method of <code>[Cache](#Cache)</code>  

* * *

<a name="Cache+all"></a>

### cache.all() ⇒ <code>object</code>
Returns object of all cached items

**Kind**: instance method of <code>[Cache](#Cache)</code>  

* * *

<a name="Cache+flush"></a>

### cache.flush() ⇒ <code>Thenable</code>
Clears all items from the cache

**Kind**: instance method of <code>[Cache](#Cache)</code>  
**Returns**: <code>Thenable</code> - Visual Studio Code Thenable (Promise)  

* * *

<a name="Cache+expiration"></a>

### cache.expiration(key) ⇒ <code>number</code>
Gets the expiration time for the cached item

**Kind**: instance method of <code>[Cache](#Cache)</code>  
**Returns**: <code>number</code> - Unix Timestamp in seconds  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>key</td><td><code>string</code></td><td><p>The unique key for the cached item</p>
</td>
    </tr>  </tbody>
</table>


* * *

<a name="Cache+isExpired"></a>

### cache.isExpired(item) ⇒ <code>boolean</code>
Checks to see if cached item is expired

**Kind**: instance method of <code>[Cache](#Cache)</code>  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>item</td><td><code>object</code></td><td><p>Cached item object</p>
</td>
    </tr>  </tbody>
</table>


* * *

