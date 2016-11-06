const assert = require('assert');
const ExtensionContext = require('./ExtensionContextMock');
const Cache = require('../index.js');

// Test ExtensionContext Mock
describe('ExtensionContextMock', function () {

  describe('globalState.update()', function () {

    it('should return true when updating a value', function () {
      let context = new ExtensionContext();
      context.globalState.update('foo', 'bar')
        .then((value) => {
          assert.equal(value, true);
        });
    });

    it('should return true when updating value with undefined', function () {
      let context = new ExtensionContext();
      context.globalState.update('foo', undefined)
        .then((value) => {
          assert.equal(value, true);
        });
    });

  });

  describe('globalState.get()', function () {

    it('should return the value when getting the value', function () {
      let context = new ExtensionContext();
      context.globalState.update('foo', 'bar')
        .then((value) => {
          assert.equal(context.globalState.get('foo'), 'bar');
        });
    });

  });

});

describe('Cache', function () {

  describe('constructor', function () {

    it('should set the context properly', function () {
      let context = new ExtensionContext();
      let cache = new Cache(context);
      assert.equal(cache.context, context);
    });

    it('should set the namespace properly', function () {
      let context = new ExtensionContext();
      let namespace = 'foo';
      let cache = new Cache(context, namespace);
      assert.equal(cache.namespace, namespace);
    });

    it('should set the cache as an empty object', function () {
      let context = new ExtensionContext();
      let cache = new Cache(context);
      assert.deepEqual(cache.cache, {});
    });

  });

  describe('put', function () {

    it('should set the value in the cache', function () {
      let context = new ExtensionContext();
      let cache = new Cache(context);
      let key = 'foo';
      let value = 'bar';
      return cache.put(key, value)
        .then(() => {
          assert.equal(cache.cache[key].value, value);
        });
    });

    it('returned Promise should resolve to false if a numeric key is provided', function () {
      let context = new ExtensionContext();
      let cache = new Cache(context);
      return cache.put(100, 'bar')
        .then((success) => {
          assert.equal(success, false);
        });
    });

    it('returned Promise should resolve to false if an object key is provided', function () {
      let context = new ExtensionContext();
      let cache = new Cache(context);
      let obj = {};
      return cache.put(obj, 'bar')
        .then((success) => {
          assert.equal(success, false);
        });
    });

    it('returned Promise should resolve to false if a boolean key is provided', function () {
      let context = new ExtensionContext();
      let cache = new Cache(context);
      return cache.put(true, 'bar')
        .then((success) => {
          assert.equal(success, false);
        });
    });

    it('should set expirations properly', function () {
      let context = new ExtensionContext();
      let cache = new Cache(context);
      let now = Math.floor(Date.now() / 1000);
      let lifetime = 5;
      let key = 'foo';
      let value = 'bar';
      return cache.put(key, value, lifetime)
        .then((success) => {
          assert.equal(cache.getExpiration(key), now + lifetime);
        });
    });

    it('should expire items properly', function (done) {
      this.timeout(3000);

      let context = new ExtensionContext();
      let cache = new Cache(context);
      let now = Math.floor(Date.now() / 1000);
      let lifetime = 1;
      let key = 'foo';
      let value = 'bar';
      cache.put(key, value, lifetime)
        .then((success) => {
          return setTimeout(function () {
            assert.equal(typeof (cache.get(key)), 'undefined');
            done();
          }, 2000);
        });
    });

  });

});
