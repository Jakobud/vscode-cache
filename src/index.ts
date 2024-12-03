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
 * @returns {Cache} The cache object
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
   * @function updateGlobalState
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
   * @function put
   * @desc Store an item in the cache, with optional expiration
   * @param {string} key The unique key for the cached item
   * @param {any} value The value to cache
   * @param {number} [expiration] Optional relative expiration time in milliseconds
   * @returns {Cache} This Cache object
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
   * Alias for {@link put}
   * @see put
   */
  public set(key: string, value: any, expiration?: number): this {
    return this.put(key, value, expiration);
  }

  /**
   * Alias for {@link put}
   * @see put
   */
  public save(key: string, value: any, expiration?: number): this {
    return this.put(key, value, expiration);
  }

  /**
   * Alias for {@link put}
   * @see put
   */
  public store(key: string, value: any, expiration?: number): this {
    return this.put(key, value, expiration);
  }

  /**
   * Alias for {@link put}
   * @see put
   */
  public cache(key: string, value: any, expiration?: number): this {
    return this.put(key, value, expiration);
  }

  /**
   * @function get
   * @desc Get an item from the cache, or the optional default value
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
   * Alias for {@link get}
   * @see get
   */
  public fetch(key: string, defaultValue?: any): any {
    return this.get(key, defaultValue);
  }

  /**
   * Alias for {@link get}
   * @see get
   */
  public retrieve(key: string, defaultValue?: any): any {
    return this.get(key, defaultValue);
  }

  /**
   * @function setExpiration
   * @desc Set the relative expiration time for a cached item
   * @param {string} key The unique key for the cached item
   * @param {number} expiration The expiration time in milliseconds relative to the current time
   * @returns this
   */
  public setExpiration(key: string, expiration: number): this {
    if (expiration && Number.isInteger(expiration)) {
      return this.setAbsoluteExpiration(key, Date.now() + expiration);
    }

    return this;
  }

  /**
   * @function setAbsoluteExpiration
   * @desc Set the absolute expiration time for a cached item
   * @param {string} key The unique key for the cached item
   * @param {number} expiration The expiration time in UNIX timestamp milliseconds
   * @returns this
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
   * @function getExpiration
   * @desc Gets the expiration time for the cached item
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
   * @function has
   * @desc Checks to see if unexpired item exists in the cache
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
   * Alias for {@link has}
   * @see has
   */
  public exists(key: string): boolean {
    return this.has(key);
  }

  /**
   * @function isExpired
   * @desc Checks to see if cached item is expired
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
   * @function forget
   * @desc Removes an item from the cache
   * @param {string} key The unique key for the cached item
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

  /**
   * Alias for {@link forget}
   * @see forget
   */
  remove(key: string): this {
    return this.forget(key);
  }

  /**
   * Alias for {@link forget}
   * @see forget
   */
  delete(key: string): this {
    return this.forget(key);
  }

  /**
   * Alias for {@link forget}
   * @see forget
   */
  clear(key: string): this {
    return this.forget(key);
  }

  /**
   * @function keys
   * @desc Get an array of all cached item keys
   * @return {string[]}
   */
  public keys() {
    return Object.keys(this.storage);
  }

  /**
   * @function all
   * @desc Returns object of all cached items
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
   * Alias for {@link all}
   * @see all
   */
  public getAll() {
    return this.all();
  }

  /**
   * @function flush
   * @desc Clears all items from the cache
   * @returns this
   */
  public flush() {
    this.storage = {};

    // Update the extension's globalState
    this.updateGlobalState();

    return this;
  }

  /**
   * Alias for {@link flush}
   * @see flush
   */
  public clearAll() {
    return this.flush();
  }

  /**
   * Alias for {@link flush}
   * @see flush
   */
  public deleteAll() {
    return this.flush();
  }
}

export default Cache;
