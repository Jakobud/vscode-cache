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

<a name="Cache"></a>

## Cache
**Kind**: global class  

* [Cache](#Cache)
    * [new Cache(context, [namespace])](#new_Cache_new)
    * [.put](#Cache+put) ⇒ <code>this</code>
    * [.set](#Cache+set) ⇒ <code>this</code>
    * [.save](#Cache+save) ⇒ <code>this</code>
    * [.store](#Cache+store) ⇒ <code>this</code>
    * [.cache](#Cache+cache) ⇒ <code>this</code>
    * [.get](#Cache+get) ⇒ <code>any</code>
    * [.fetch](#Cache+fetch) ⇒ <code>any</code>
    * [.retrieve](#Cache+retrieve) ⇒ <code>any</code>
    * [.setExpiration](#Cache+setExpiration) ⇒ <code>this</code>
    * [.setAbsoluteExpiration](#Cache+setAbsoluteExpiration) ⇒ <code>this</code>
    * [.getExpiration](#Cache+getExpiration) ⇒ <code>number</code>
    * [.has](#Cache+has) ⇒ <code>boolean</code>
    * [.exists](#Cache+exists) ⇒ <code>boolean</code>
    * [.isExpired](#Cache+isExpired) ⇒ <code>boolean</code>
    * [.forget](#Cache+forget) ⇒ <code>this</code>
    * [.remove](#Cache+remove) ⇒ <code>this</code>
    * [.delete](#Cache+delete) ⇒ <code>this</code>
    * [.clear](#Cache+clear) ⇒ <code>this</code>
    * [.keys](#Cache+keys) ⇒ <code>Array.&lt;string&gt;</code>
    * [.all](#Cache+all) ⇒ <code>object</code>
    * [.getAll](#Cache+getAll) ⇒ <code>object</code>
    * [.flush](#Cache+flush) ⇒ <code>this</code>
    * [.clearAll](#Cache+clearAll) ⇒ <code>this</code>
    * [.deleteAll](#Cache+deleteAll) ⇒ <code>this</code>
    * [.removeAll](#Cache+removeAll) ⇒ <code>this</code>
    * [.forgetAll](#Cache+forgetAll) ⇒ <code>this</code>

<a name="new_Cache_new"></a>

### new Cache(context, [namespace])
<p>A module for use in developing a Visual Studio Code extension. It allows an extension to cache values across sessions with optional expiration times using the ExtensionContext.globalState.</p>

<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>context</td><td><code>ExtensionContext</code></td><td><p>The Visual Studio Code extension context</p></td>
    </tr><tr>
    <td>[namespace]</td><td><code>string</code></td><td><p>Optional namespace for cached items. Defaults to &quot;cache&quot;</p></td>
    </tr>  </tbody>
</table>

<a name="Cache+put"></a>

### cache.put ⇒ <code>this</code>
<p>Store an item in the cache, with optional expiration</p>

**Kind**: instance property of [<code>Cache</code>](#Cache)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>key</td><td><code>string</code></td><td><p>The unique key for the cached item</p></td>
    </tr><tr>
    <td>value</td><td><code>any</code></td><td><p>The value to cache</p></td>
    </tr><tr>
    <td>[expiration]</td><td><code>number</code></td><td><p>Optional relative expiration time in milliseconds</p></td>
    </tr>  </tbody>
</table>

**Example**  
```js
// Basic usage
cache.put('foo', 'bar');
```
**Example**  
```js
// Adding expiration
cache.put('boz', 'cuz', 10000);
```
<a name="Cache+set"></a>

### cache.set ⇒ <code>this</code>
<p>Alias of put</p>

**Kind**: instance property of [<code>Cache</code>](#Cache)  
**Example**  
```js
cache.set('foo', 'bar');
```
<a name="Cache+save"></a>

### cache.save ⇒ <code>this</code>
<p>Alias of put</p>

**Kind**: instance property of [<code>Cache</code>](#Cache)  
**Example**  
```js
cache.save('foo', 'bar');
```
<a name="Cache+store"></a>

### cache.store ⇒ <code>this</code>
<p>Alias of put</p>

**Kind**: instance property of [<code>Cache</code>](#Cache)  
**Example**  
```js
cache.store('foo', 'bar');
```
<a name="Cache+cache"></a>

### cache.cache ⇒ <code>this</code>
<p>Alias of put</p>

**Kind**: instance property of [<code>Cache</code>](#Cache)  
**Example**  
```js
cache.cache('foo', 'bar');
```
<a name="Cache+get"></a>

### cache.get ⇒ <code>any</code>
<p>Get an item from the cache, or the optional default value</p>

**Kind**: instance property of [<code>Cache</code>](#Cache)  
**Returns**: <code>any</code> - <p>Returns the cached value or optional defaultValue</p>  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>key</td><td><code>string</code></td><td><p>The unique key for the cached item</p></td>
    </tr><tr>
    <td>[defaultValue]</td><td><code>any</code></td><td><p>The optional default value to return if the cached item does not exist or is expired</p></td>
    </tr>  </tbody>
</table>

**Example**  
```js
// Basic usage
const foo = cache.get('foo');
```
**Example**  
```js
// Providing default value
const bar = cache.get('bar', 'some default value');
```
<a name="Cache+fetch"></a>

### cache.fetch ⇒ <code>any</code>
<p>Alias of get</p>

**Kind**: instance property of [<code>Cache</code>](#Cache)  
**Example**  
```js
const foo = cache.fetch('foo');
```
<a name="Cache+retrieve"></a>

### cache.retrieve ⇒ <code>any</code>
<p>Alias of get</p>

**Kind**: instance property of [<code>Cache</code>](#Cache)  
**Example**  
```js
const foo = cache.retrieve('foo');
```
<a name="Cache+setExpiration"></a>

### cache.setExpiration ⇒ <code>this</code>
<p>Set the relative expiration time for a cached item</p>

**Kind**: instance property of [<code>Cache</code>](#Cache)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>key</td><td><code>string</code></td><td><p>The unique key for the cached item</p></td>
    </tr><tr>
    <td>expiration</td><td><code>number</code></td><td><p>The expiration time in milliseconds relative to the current time</p></td>
    </tr>  </tbody>
</table>

**Example**  
```js
// Set expiration for 10 seconds
cache.setExpiration('foo', 10000);
```
<a name="Cache+setAbsoluteExpiration"></a>

### cache.setAbsoluteExpiration ⇒ <code>this</code>
<p>Set the absolute expiration time for a cached item</p>

**Kind**: instance property of [<code>Cache</code>](#Cache)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>key</td><td><code>string</code></td><td><p>The unique key for the cached item</p></td>
    </tr><tr>
    <td>expiration</td><td><code>number</code></td><td><p>The expiration time in UNIX timestamp milliseconds</p></td>
    </tr>  </tbody>
</table>

**Example**  
```js
// Set expiration for December 25, 2050, 12:00:00 PM GMT
cache.setAbsoluteExpiration('foo', 2555582400000);
```
<a name="Cache+getExpiration"></a>

### cache.getExpiration ⇒ <code>number</code>
<p>Gets the expiration time for the cached item</p>

**Kind**: instance property of [<code>Cache</code>](#Cache)  
**Returns**: <code>number</code> - <p>Unix Timestamp in seconds</p>  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>key</td><td><code>string</code></td><td><p>The unique key for the cached item</p></td>
    </tr>  </tbody>
</table>

**Example**  
```js
// Get expiration time for 'foo'
const expiration = cache.getExpiration('foo');
```
<a name="Cache+has"></a>

### cache.has ⇒ <code>boolean</code>
<p>Checks to see if unexpired item exists in the cache</p>

**Kind**: instance property of [<code>Cache</code>](#Cache)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>key</td><td><code>string</code></td><td><p>The unique key for the cached item</p></td>
    </tr>  </tbody>
</table>

**Example**  
```js
// Check if 'foo' exists
if (cache.has('foo')) { ... }
```
<a name="Cache+exists"></a>

### cache.exists ⇒ <code>boolean</code>
<p>Alias of has</p>

**Kind**: instance property of [<code>Cache</code>](#Cache)  
**Example**  
```js
if (cache.exists('foo')) { ... }
```
<a name="Cache+isExpired"></a>

### cache.isExpired ⇒ <code>boolean</code>
<p>Checks to see if cached item is expired</p>

**Kind**: instance property of [<code>Cache</code>](#Cache)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>key</td><td><code>string</code></td><td><p>The unique key for the cached item</p></td>
    </tr>  </tbody>
</table>

**Example**  
```js
// Check if 'foo' is expired
if (cache.isExpired('foo')) { ... }
```
<a name="Cache+forget"></a>

### cache.forget ⇒ <code>this</code>
<p>Removes an item from the cache</p>

**Kind**: instance property of [<code>Cache</code>](#Cache)  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>key</td><td><code>string</code></td><td><p>The unique key for the cached item</p></td>
    </tr>  </tbody>
</table>

**Example**  
```js
// Remove 'foo' from the cache
cache.forget('foo');
```
<a name="Cache+remove"></a>

### cache.remove ⇒ <code>this</code>
<p>Alias of forget</p>

**Kind**: instance property of [<code>Cache</code>](#Cache)  
**Example**  
```js
cache.remove('foo');
```
<a name="Cache+delete"></a>

### cache.delete ⇒ <code>this</code>
<p>Alias of forget</p>

**Kind**: instance property of [<code>Cache</code>](#Cache)  
**Example**  
```js
cache.delete('foo');
```
<a name="Cache+clear"></a>

### cache.clear ⇒ <code>this</code>
<p>Alias of forget</p>

**Kind**: instance property of [<code>Cache</code>](#Cache)  
**Example**  
```js
cache.clear('foo');
```
<a name="Cache+keys"></a>

### cache.keys ⇒ <code>Array.&lt;string&gt;</code>
<p>Get an array of all cached item keys</p>

**Kind**: instance property of [<code>Cache</code>](#Cache)  
**Example**  
```js
// Get all keys
const keys = cache.keys();
```
<a name="Cache+all"></a>

### cache.all ⇒ <code>object</code>
<p>Returns object of all cached items</p>

**Kind**: instance property of [<code>Cache</code>](#Cache)  
**Example**  
```js
// Get all items
const items = cache.all();
```
<a name="Cache+getAll"></a>

### cache.getAll ⇒ <code>object</code>
<p>Alias of all</p>

**Kind**: instance property of [<code>Cache</code>](#Cache)  
**Example**  
```js
const items = cache.getAll();
```
<a name="Cache+flush"></a>

### cache.flush ⇒ <code>this</code>
<p>Clears all items from the cache</p>

**Kind**: instance property of [<code>Cache</code>](#Cache)  
**Example**  
```js
// Clear all items
cache.flush();
```
<a name="Cache+clearAll"></a>

### cache.clearAll ⇒ <code>this</code>
<p>Alias of flush</p>

**Kind**: instance property of [<code>Cache</code>](#Cache)  
**Example**  
```js
cache.clearAll();
```
<a name="Cache+deleteAll"></a>

### cache.deleteAll ⇒ <code>this</code>
<p>Alias of flush</p>

**Kind**: instance property of [<code>Cache</code>](#Cache)  
**Example**  
```js
cache.deleteAll();
```
<a name="Cache+removeAll"></a>

### cache.removeAll ⇒ <code>this</code>
<p>Alias of flush</p>

**Kind**: instance property of [<code>Cache</code>](#Cache)  
**Example**  
```js
cache.removeAll();
```
<a name="Cache+forgetAll"></a>

### cache.forgetAll ⇒ <code>this</code>
<p>Alias of flush</p>

**Kind**: instance property of [<code>Cache</code>](#Cache)  
**Example**  
```js
cache.forgetAll();
```
