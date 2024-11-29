'use strict';

import * as vscode from 'vscode';

interface CacheItem {
  value: any;
  expiration?: number;
}

const defaultNamespace = 'cache';

/**
 * @class Cache
 * @desc A module for use in developing a Visual Studio Code extension. It allows an extension to cache values across sessions with optional expiration times using the ExtensionContext.globalState.
 * @param {vscode.ExtensionContext} context - The Visual Studio Code extension context
 * @param {string} [namespace] - Optional namespace for cached items. Defaults to "cache"
 * @returns {Cache} The cache object
 */
class Cache {
  private context: vscode.ExtensionContext;
  private namespace: string;
  private storage: { [key: string]: CacheItem };

  public constructor(context: vscode.ExtensionContext, namespace?: string) {
    // ExtensionContext
    this.context = context;

    // Namespace of the context's globalState
    this.namespace = namespace || defaultNamespace;

    // Local cache object
    this.storage = this.context.globalState.get(this.namespace, {});
  }

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
   * @method
   * @desc Store an item in the cache, with optional expiration
   * @param {string} key - The unique key for the cached item
   * @param {any} value - The value to cache
   * @param {number} [expiration] - Optional expiration time as UNIX timestamp milliseconds
   * @returns {Cache} - This Cache object
   */
  public put(key: string, value: any, expiration?: number): this {
    if (typeof (key) !== 'string') {
      return this;
    }

    let obj: CacheItem = {
      value: value,
    };

    // Set optional expiration
    if (expiration && Number.isInteger(expiration) && expiration >= Date.now()) {
      obj.expiration = expiration;
    }

    // Save to local cache object
    this.storage[key] = obj;

    // Update the extension's globalState
    this.updateGlobalState();

    return this;
  }

  // Alias of put
  public set(key: string, value: any, expiration?: number): this {
    return this.put(key, value, expiration);
  }

  // Alias of put
  public save(key: string, value: any, expiration?: number): this {
    return this.put(key, value, expiration);
  }

  // Alias of put
  public store(key: string, value: any, expiration?: number): this {
    return this.put(key, value, expiration);
  }

  // Alias of put
  public cache(key: string, value: any, expiration?: number): this {
    return this.put(key, value, expiration);
  }

  /**
   * @name get
   * @desc Get an item from the cache, or the optional default value
   * @function
   * @param {string} key - The unique key for the cached item
   * @param {any} [defaultValue] - The optional default value to return if the cached item does not exist or is expired
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
        return undefined;
      }

      // Otherwise return the value
      return this.storage[key].value;
    }
  }

  // Alias of get
  public fetch(key: string, defaultValue?: any): any {
    return this.get(key, defaultValue);
  }

  // Alias of get
  public retrieve(key: string, defaultValue?: any): any {
    return this.get(key, defaultValue);
  }

  /**
   * @name has
   * @desc Checks to see if unexpired item exists in the cache
   * @function
   * @param {string} key - The unique key for the cached item
   * @return {boolean}
   */
  public has(key: string): boolean {
    if (typeof (this.storage[key]) === 'undefined') {
      return false;
    } else {
      return this.isExpired(key) ? false : true;
    }
  }

  // Alias of has
  public exists(key: string): boolean {
    return this.has(key);
  }

  /**
   * @name isExpired
   * @desc Checks to see if cached item is expired
   * @function
   * @param {object} item - Cached item object
   * @return {boolean}
   */
  public isExpired(key: string): boolean {
    // If key doesn't exist or it has no expiration
    if (typeof (this.storage[key]) === 'undefined' || typeof (this.storage[key].expiration) === 'undefined') {
      return false;
    } else {
      // Is expiration >= right now?
      return this.now() >= this.storage[key].expiration;
    }
  }

  /**
   * @name forget
   * @desc Removes an item from the cache
   * @function
   * @param {string} key - The unique key for the cached item
   * @returns this
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

  // Alias of forget
  remove(key: string): this {
    return this.forget(key);
  }

  // Alias of forget
  delete(key: string): this {
    return this.forget(key);
  }

  /**
   * @name now
   * @desc Helpfer function to get the current timestamp
   * @function
   * @private
   * @return {number} Current Unix Timestamp in seconds
   */
  private now() {
    return Math.floor(Date.now() / 1000);
  }

  /**
   * @name keys
   * @desc Get an array of all cached item keys
   * @function
   * @return {string[]}
   */
  public keys() {
    return Object.keys(this.storage);
  }

  /**
   * @name all
   * @desc Returns object of all cached items
   * @function
   * @return {object}
   */
  public all() {
    // let items = {};
    // for (let key in this.storage) {
    //   items[key] = this.storage[key].value;
    // }
    // return items;
    return this.storage;
  }

  // Alias of all
  public getAll() {
    return this.all();
  }

  /**
   * @name flush
   * @desc Clears all items from the cache
   * @function
   * @returns this - The Cache object
   */
  public flush() {
    this.storage = {};

    // Update the extension's globalState
    this.updateGlobalState();

    return this;
  }

  // Alias of flush
  public clearAll() {
    return this.flush();
  }

  /**
   * @name getExpiration
   * @desc Gets the expiration time for the cached item
   * @function
   * @param {string} key - The unique key for the cached item
   * @return {number} Unix Timestamp in seconds
   */
  public getExpiration(key: string): number | undefined {
    if (typeof (this.storage[key]) === 'undefined' || typeof (this.storage[key].expiration) === 'undefined') {
      return undefined;
    } else {
      return this.storage[key].expiration;
    }
  }
}

export default Cache;
