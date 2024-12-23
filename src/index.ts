'use strict';

import { ExtensionContext } from 'vscode';

interface CacheItem {
  value: any;
  expiration?: number;
}

const defaultNamespace = 'cache';

/**
 * @class Cache
 * @desc A module for use in developing a Visual Studio Code extension. It allows an extension to cache values across sessions with optional expiration times using the ExtensionContext.globalState.
 * @param {ExtensionContext} context The Visual Studio Code extension context
 * @param {string} [namespace] Optional namespace for cached items. Defaults to "cache"
 * @returns {this}
 */
class Cache {
  private context: ExtensionContext;
  private namespace: string;
  private storage: { [key: string]: CacheItem };

  public constructor(context: ExtensionContext, namespace?: string) {
    // ExtensionContext
    this.context = context;

    // Namespace of the context's globalState
    this.namespace = namespace || defaultNamespace;

    // Local cache object
    this.storage = this.context.globalState.get(this.namespace, {});
  }

  /**
   * @name updateGlobalState
   * @private
   * @desc Updates the VSCode extension's globalState with the current cache object
   */
  private updateGlobalState() {
    (async () => {
      try {
        // Save to extension's globalState
        await this.context.globalState.update(this.namespace, this.storage);
      } catch (error) {
        throw error;
      }
    })();
  }

  /**
   * @name put
   * @memberof Cache
   * @instance
   * @desc Store an item in the cache, with optional expiration
   * @example // Basic usage
   * cache.put('foo', 'bar');
   * @example // Adding expiration
   * cache.put('boz', 'cuz', 10000);
   * @param {string} key The unique key for the cached item
   * @param {any} value The value to cache
   * @param {number} [expiration] Optional relative expiration time in milliseconds
   * @returns {this}
   */
  public put(key: string, value: any, expiration?: number): this {
    if (typeof key !== 'string') {
      return this;
    }

    // Save to local cache object
    this.storage[key] = {
      value: value,
    };

    // Set optional expiration
    if (expiration) {
      this.setExpiration(key, expiration);
    }

    // Update the extension's globalState
    this.updateGlobalState();

    return this;
  }

  /**
   * @name set
   * @memberof Cache
   * @instance
   * @desc Alias of put
   * @example
   * cache.set('foo', 'bar');
   * @returns {this}
   */
  public set(key: string, value: any, expiration?: number): this {
    return this.put(key, value, expiration);
  }

  /**
   * @name save
   * @memberof Cache
   * @instance
   * @desc Alias of put
   * @example
   * cache.save('foo', 'bar');
   * @returns {this}
   */
  public save(key: string, value: any, expiration?: number): this {
    return this.put(key, value, expiration);
  }

  /**
   * @name store
   * @memberof Cache
   * @instance
   * @desc Alias of put
   * @example
   * cache.store('foo', 'bar');
   * @returns {this}
   */
  public store(key: string, value: any, expiration?: number): this {
    return this.put(key, value, expiration);
  }

  /**
   * @name cache
   * @memberof Cache
   * @instance
   * @desc Alias of put
   * @example
   * cache.cache('foo', 'bar');
   * @returns {this}
   */
  public cache(key: string, value: any, expiration?: number): this {
    return this.put(key, value, expiration);
  }

  /**
   * @name get
   * @memberof Cache
   * @instance
   * @desc Get an item from the cache, or the optional default value
   * @example // Basic usage
   * const foo = cache.get('foo');
   * @example // Providing default value
   * const bar = cache.get('bar', 'some default value');
   * @param {string} key The unique key for the cached item
   * @param {any} [defaultValue] The optional default value to return if the cached item does not exist or is expired
   * @returns {any} Returns the cached value or optional defaultValue
   */
  public get(key: string, defaultValue?: any): any {
    // If doesn't exist
    if (typeof (this.storage[key]) === 'undefined') {

      // Return default value
      if (typeof (defaultValue) !== 'undefined') {
        return defaultValue;
      } else {
        return undefined;
      }

    } else {
      // Is item expired?
      if (this.isExpired(key)) {

        // Return default value
        if (typeof (defaultValue) !== 'undefined') {
          return defaultValue;
        } else {
          return undefined;
        }
      }

      // Otherwise return the value
      return this.storage[key].value;
    }
  }

  /**
   * @name fetch
   * @memberof Cache
   * @instance
   * @desc Alias of get
   * @example
   * const foo = cache.fetch('foo');
   * @returns {any}
   */
  public fetch(key: string, defaultValue?: any): any {
    return this.get(key, defaultValue);
  }

  /**
   * @name retrieve
   * @memberof Cache
   * @instance
   * @desc Alias of get
   * @example
   * const foo = cache.retrieve('foo');
   * @returns {any}
   */
  public retrieve(key: string, defaultValue?: any): any {
    return this.get(key, defaultValue);
  }

  /**
   * @name setExpiration
   * @memberof Cache
   * @instance
   * @desc Set the relative expiration time for a cached item
   * @example // Set expiration for 10 seconds
   * cache.setExpiration('foo', 10000);
   * @param {string} key The unique key for the cached item
   * @param {number} expiration The expiration time in milliseconds relative to the current time
   * @returns {this}
   */
  public setExpiration(key: string, expiration: number): this {
    if (expiration && Number.isInteger(expiration)) {
      return this.setAbsoluteExpiration(key, Date.now() + expiration);
    }

    return this;
  }

  /**
   * @name setAbsoluteExpiration
   * @memberof Cache
   * @instance
   * @desc Set the absolute expiration time for a cached item
   * @example // Set expiration for December 25, 2050, 12:00:00 PM GMT
   * cache.setAbsoluteExpiration('foo', 2555582400000);
   * @param {string} key The unique key for the cached item
   * @param {number} expiration The expiration time in UNIX timestamp milliseconds
   * @returns {this}
   */
  public setAbsoluteExpiration(key: string, expiration: number): this {
    // If the cached item doesn't exist
    if (!this.has(key)) {
      return this;
    }

    // Set the expiration time
    if (expiration && Number.isInteger(expiration) && expiration > Date.now()) {
      this.storage[key].expiration = expiration;

      // Update the extension's globalState
      this.updateGlobalState();
    }

    return this;
  }

  /**
   * @name getExpiration
   * @memberof Cache
   * @instance
   * @desc Gets the expiration time for the cached item
   * @example // Get expiration time for 'foo'
   * const expiration = cache.getExpiration('foo');
   * @param {string} key The unique key for the cached item
   * @return {number} Unix Timestamp in seconds
   */
  public getExpiration(key: string): number | undefined {
    if (typeof (this.storage[key]) === 'undefined' || typeof (this.storage[key].expiration) === 'undefined' || this.storage[key].expiration <= Date.now()) {
      return undefined;
    } else {
      return this.storage[key].expiration;
    }
  }

  /**
   * @name has
   * @memberof Cache
   * @instance
   * @desc Checks to see if unexpired item exists in the cache
   * @example // Check if 'foo' exists
   * if (cache.has('foo')) { ... }
   * @param {string} key The unique key for the cached item
   * @return {boolean}
   */
  public has(key: string): boolean {
    if ((typeof (this.storage[key]) === 'undefined') || (this.storage[key].expiration && this.storage[key].expiration <= Date.now())) {
      return false;
    } else {
      return this.isExpired(key) ? false : true;
    }
  }

  /**
   * @name exists
   * @memberof Cache
   * @instance
   * @desc Alias of has
   * @example
   * if (cache.exists('foo')) { ... }
   * @returns {boolean}
   */
  public exists(key: string): boolean {
    return this.has(key);
  }

  /**
   * @name isExpired
   * @memberof Cache
   * @instance
   * @desc Checks to see if cached item is expired
   * @example // Check if 'foo' is expired
   * if (cache.isExpired('foo')) { ... }
   * @param {string} key The unique key for the cached item
   * @return {boolean}
   */
  public isExpired(key: string): boolean {
    // If key doesn't exist or it has no expiration
    if (typeof (this.storage[key]) === 'undefined' || typeof (this.storage[key].expiration) === 'undefined') {
      return false;
    } else {
      // Is the expiration time in the future?
      return this.storage[key].expiration <= Date.now();
    }
  }

  /**
   * @name forget
   * @memberof Cache
   * @instance
   * @desc Removes an item from the cache
   * @example // Remove 'foo' from the cache
   * cache.forget('foo');
   * @param {string} key The unique key for the cached item
   * @returns {this}
   */
  public forget(key: string): this {
    // Does item exist?
    if (this.has(key)) {
      // Delete from local object
      delete this.storage[key];

      // Update the extension's globalState
      this.updateGlobalState();
    }

    return this;
  }

  /**
   * @name remove
   * @memberof Cache
   * @instance
   * @desc Alias of forget
   * @example
   * cache.remove('foo');
   * @returns {this}
   */
  remove(key: string): this {
    return this.forget(key);
  }

  /**
   * @name delete
   * @memberof Cache
   * @instance
   * @desc Alias of forget
   * @example
   * cache.delete('foo');
   * @returns {this}
   */
  delete(key: string): this {
    return this.forget(key);
  }

  /**
   * @name clear
   * @memberof Cache
   * @instance
   * @desc Alias of forget
   * @example
   * cache.clear('foo');
   * @returns {this}
   */
  clear(key: string): this {
    return this.forget(key);
  }

  /**
   * @name keys
   * @memberof Cache
   * @instance
   * @desc Get an array of all cached item keys
   * @example // Get all keys
   * const keys = cache.keys();
   * @return {string[]}
   */
  public keys() {
    return Object.keys(this.storage);
  }

  /**
   * @name all
   * @memberof Cache
   * @instance
   * @desc Returns object of all cached items
   * @example // Get all items
   * const items = cache.all();
   * @return {object}
   */
  public all() {
    let items: { [key: string]: any } = {};
    for (let key in this.storage) {
      items[key] = this.storage[key].value;
    }
    return items;
  }

  /**
   * @name getAll
   * @memberof Cache
   * @instance
   * @desc Alias of all
   * @example
   * const items = cache.getAll();
   * @returns {object}
   */
  public getAll() {
    return this.all();
  }

  /**
   * @name flush
   * @memberof Cache
   * @instance
   * @desc Clears all items from the cache
   * @example // Clear all items
   * cache.flush();
   * @returns {this}
   */
  public flush() {
    this.storage = {};

    // Update the extension's globalState
    this.updateGlobalState();

    return this;
  }

  /**
   * @name clearAll
   * @memberof Cache
   * @instance
   * @desc Alias of flush
   * @example
   * cache.clearAll();
   * @returns {this}
   */
  public clearAll() {
    return this.flush();
  }

  /**
   * @name deleteAll
   * @memberof Cache
   * @instance
   * @desc Alias of flush
   * @example
   * cache.deleteAll();
   * @returns {this}
   */
  public deleteAll() {
    return this.flush();
  }

  /**
   * @name removeAll
   * @memberof Cache
   * @instance
   * @desc Alias of flush
   * @example
   * cache.removeAll();
   * @returns {this}
   */
  public removeAll() {
    return this.flush();
  }

  /**
   * @name forgetAll
   * @memberof Cache
   * @instance
   * @desc Alias of flush
   * @example
   * cache.forgetAll();
   * @returns {this}
   */
  public forgetAll() {
    return this.flush();
  }
}

export default Cache;
