'use strict';

/**
 * @class Cache
 * @desc A module for use in developing a Visual Studio Code extension. It allows an extension to cache values across sessions with optional expiration times using the ExtensionContext.globalState.
 * @param {vscode.ExtensionContext} context - The Visual Studio Code extension context
 * @param {string} [namespace] - Optional namespace for cached items. Defaults to "cache"
 * @returns {Cache} The cache object
 */
let Cache = function (context, namespace) {
  if (!context) {
    return undefined;
  }

  // ExtensionContext
  this.context = context;

  // Namespace of the context's globalState
  this.namespace = namespace || 'cache';

  // Local cache object
  this.cache = this.context.globalState.get(this.namespace, {});
}

/**
 * @name Cache#put
 * @method
 * @desc Store an item in the cache, with optional expiration
 * @param {string} key - The unique key for the cached item
 * @param {any} value - The value to cache
 * @param {number} [expiration] - Optional expiration time in seconds
 * @returns {Promise} Visual Studio Code Thenable (Promise)
 */
Cache.prototype.put = function (key, value, expiration) {

  // Parameter type checking
  if (typeof (key) !== 'string' || typeof (value) === 'undefined') {
    return new Promise((resolve, reject) => {
      resolve(false);
    });
  }

  let obj = {
    value: value
  };

  // Set expiration
  if (Number.isInteger(expiration)) {
    obj.expiration = now() + expiration;
  }

  // Save to local cache object
  this.cache[key] = obj;

  // Save to extension's globalState
  return this.context.globalState.update(this.namespace, this.cache);
}

// Alias of put
Cache.prototype.set = function (key, value, expiration) {
  return this.put(key, value, expiration);
}

// Alias of put
Cache.prototype.save = function (key, value, expiration) {
  return this.put(key, value, expiration);
}

// Alias of put
Cache.prototype.store = function (key, value, expiration) {
  return this.put(key, value, expiration);
}

// Alias of put
Cache.prototype.cache = function (key, value, expiration) {
  return this.put(key, value, expiration);
}

/**
 * @name Cache#get
 * @desc Get an item from the cache, or the optional default value
 * @function
 * @param {string} key - The unique key for the cached item
 * @param {any} [defaultValue] - The optional default value to return if the cached item does not exist or is expired
 * @returns {any} Returns the cached value or optional defaultValue
 */
Cache.prototype.get = function (key, defaultValue) {

  // If doesn't exist
  if (typeof (this.cache[key]) === 'undefined') {

    // Return default value
    if (typeof (defaultValue) !== 'undefined') {
      return defaultValue;
    } else {
      return undefined;
    }

  } else {
    // Is item expired?
    if (this.isExpired(key)) {
      return undefined;
    }
    // Otherwise return the value
    return this.cache[key].value;
  }
}

// Alias of get
Cache.prototype.fetch = function (key, defaultValue) {
  return this.get(key, defaultValue);
}

// Alias of get
Cache.prototype.retrieve = function (key, defaultValue) {
  return this.get(key, defaultValue);
}

/**
 * @name Cache#has
 * @desc Checks to see if unexpired item exists in the cache
 * @function
 * @param {string} key - The unique key for the cached item
 * @return {boolean}
 */
Cache.prototype.has = function (key) {
  if (typeof (this.cache[key]) === 'undefined') {
    return false;
  } else {
    return this.isExpired(key) ? false : true;
  }
}

// Alias of has
Cache.prototype.exists = function (key) {
  return this.has(key);
}

/**
 * @name Cache#forget
 * @desc Removes an item from the cache
 * @function
 * @param {string} key - The unique key for the cached item
 * @returns {Thenable} Visual Studio Code Thenable (Promise)
 */
Cache.prototype.forget = function (key) {
  // Does item exist?
  if (typeof (this.cache[key]) === 'undefined') {
    return new Promise(function (resolve, reject) {
      resolve(true);
    });
  }

  // Delete from local object
  delete this.cache[key];

  // Update the extension's globalState
  return this.context.globalState.update(this.namespace, this.cache);
}

// Alias of forget
Cache.prototype.remove = function (key) {
  return this.forget(key);
}

// Alias of forget
Cache.prototype.delete = function (key) {
  return this.forget(key);
}

/**
 * @name Cache#keys
 * @desc Get an array of all cached item keys
 * @function
 * @return {string[]}
 */
Cache.prototype.keys = function () {
  return Object.keys(this.cache);
}

/**
 * @name Cache#all
 * @desc Returns object of all cached items
 * @function
 * @return {object}
 */
Cache.prototype.all = function () {
  let items = {};
  for (let key in this.cache) {
    items[key] = this.cache[key].value;
  }
  return items;
}

// Alias of all
Cache.prototype.getAll = function () {
  return this.all();
}

/**
 * @name Cache#flush
 * @desc Clears all items from the cache
 * @function
 * @returns {Thenable} Visual Studio Code Thenable (Promise)
 */
Cache.prototype.flush = function () {
  this.cache = {};
  return this.context.globalState.update(this.namespace, undefined);
}

// Alias of flush
Cache.prototype.clearAll = function () {
  return this.flush();
}

/**
 * @name Cache#expiration
 * @desc Gets the expiration time for the cached item
 * @function
 * @param {string} key - The unique key for the cached item
 * @return {number} Unix Timestamp in seconds
 */
Cache.prototype.getExpiration = function (key) {
  if (typeof (this.cache[key]) === 'undefined' || typeof (this.cache[key].expiration) === 'undefined') {
    return undefined;
  } else {
    return this.cache[key].expiration;
  }
}

/**
 * @name Cache#isExpired
 * @desc Checks to see if cached item is expired
 * @function
 * @param {object} item - Cached item object
 * @return {boolean}
 */
Cache.prototype.isExpired = function (key) {

  // If key doesn't exist or it has no expiration
  if (typeof (this.cache[key]) === 'undefined' || typeof (this.cache[key].expiration) === 'undefined') {
    return false;
  } else {

    // Is expiration >= right now?
    return now() >= this.cache[key].expiration;
  }
}

/**
 * @name now
 * @desc Helpfer function to get the current timestamp
 * @function
 * @private
 * @return {number} Current Unix Timestamp in seconds
 */
const now = function () {
  return Math.floor(Date.now() / 1000);
}

module.exports = Cache;