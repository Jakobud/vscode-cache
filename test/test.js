const assert = require('assert');
const Promise = require('bluebird');
const ExtensionContext = require('./ExtensionContextMock');
const Cache = require('../index.js');

// Test ExtensionContext Mock
describe('ExtensionContextMock', function () {

  describe('globalState.update()', function () {

    it('should return true when updating a value', function () {
      let context = new ExtensionContext();
      return context.globalState.update('foo', 'bar')
        .then(function (value) {
          assert.equal(value, true);
        });
    });

    it('should return true when updating value with undefined', function () {
      let context = new ExtensionContext();
      return context.globalState.update('foo', undefined)
        .then(function (value) {
          assert.equal(value, true);
        });
    });

  });

  describe('globalState.get()', function () {

    it('should return the value when getting the value', function () {
      let context = new ExtensionContext();
      return context.globalState.update('foo', 'bar')
        .then(function (value) {
          assert.equal(context.globalState.get('foo'), 'bar');
        });
    });

  });

});

describe('Cache', function () {

  describe('constructor', function () {

    it('should set the context', function () {
      let context = new ExtensionContext();
      let cache = new Cache(context);
      assert.equal(cache.context, context);
    });

    it('should set the namespace', function () {
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

    it('should namespace multiple caches', function () {
      let context = new ExtensionContext();
      let cache1 = new Cache(context, 'cache1');
      let cache2 = new Cache(context, 'cache2');
      let key = 'foo';
      let value1 = 'bar1';
      let value2 = 'bar2';
      return cache1.put(key, value1)
        .then(function () {
          return cache2.put(key, value2);
        })
        .then(function () {
          assert.notEqual(cache1.get(key), cache2.get(key));
        });

    });

  });

  describe('put', function () {

    it('should set the value in the cache', function () {
      let context = new ExtensionContext();
      let cache = new Cache(context);
      let key = 'foo';
      let value = 'bar';
      return cache.put(key, value)
        .then(function () {
          assert.equal(cache.get(key), value);
        });
    });

    it('returned Promise should resolve to false if a numeric key is provided', function () {
      let context = new ExtensionContext();
      let cache = new Cache(context);
      return cache.put(100, 'bar')
        .then(function (success) {
          assert.equal(success, false);
        });
    });

    it('returned Promise should resolve to false if an object key is provided', function () {
      let context = new ExtensionContext();
      let cache = new Cache(context);
      let obj = {};
      return cache.put(obj, 'bar')
        .then(function (success) {
          assert.equal(success, false);
        });
    });

    it('returned Promise should resolve to false if a boolean key is provided', function () {
      let context = new ExtensionContext();
      let cache = new Cache(context);
      return cache.put(true, 'bar')
        .then(function (success) {
          assert.equal(success, false);
        });
    });

    it('should set expirations', function () {
      let context = new ExtensionContext();
      let cache = new Cache(context);
      let now = Math.floor(Date.now() / 1000);
      let lifetime = 5;
      let key = 'foo';
      let value = 'bar';
      return cache.put(key, value, lifetime)
        .then(function () {
          assert.equal(cache.getExpiration(key), now + lifetime);
        });
    });

    it('should expire items', function (done) {
      this.timeout(3000);

      let context = new ExtensionContext();
      let cache = new Cache(context);
      let now = Math.floor(Date.now() / 1000);
      let lifetime = 1;
      let key = 'foo';
      let value = 'bar';
      cache.put(key, value, lifetime)
        .then(function () {
          setTimeout(function () {
            assert.equal(typeof (cache.get(key)), 'undefined');
            done();
          }, 2000);
        });
    });

  });

  describe('has', function () {

    it('should indicate when a cached item exists', function () {
      let context = new ExtensionContext();
      let cache = new Cache(context);
      let key = 'foo';
      let value = 'bar';
      return cache.put(key, value)
        .then(function () {
          assert(cache.has(key));
        });
    });

    it('should indicate when an expired item does not exist', function (done) {
      this.timeout(3000);

      let context = new ExtensionContext();
      let cache = new Cache(context);
      let now = Math.floor(Date.now() / 1000);
      let lifetime = 1;
      let key = 'foo';
      let value = 'bar';
      cache.put(key, value, lifetime)
        .then(function () {
          setTimeout(function () {
            assert.equal(cache.has(key), false);
            done();
          }, 2000);
        });
    });

  });

  describe('forget', function () {

    it('should remove a cache item', function () {
      let context = new ExtensionContext();
      let cache = new Cache(context);
      let key = 'foo';
      let value = 'bar';
      return cache.put(key, value)
        .then(function () {
          return cache.forget(key);
        })
        .then(function () {
          assert.equal(cache.has(key), false);
        });
    });

  });

  describe('keys', function () {

    it('should return an array of all cache keys', function (done) {
      let context = new ExtensionContext();
      let cache = new Cache(context);
      let keys = [
        'key1',
        'key2',
        'key3'
      ];
      let value = 'foo';
      let promises = [];
      for (let key of keys) {
        promises.push(new Promise(function (resolve, reject) {
          cache.put(key, value)
            .then(function () {
              resolve(key);
            });

        }));
      }
      Promise.all(promises)
        .then(function (values) {
          assert.deepEqual(cache.keys(), keys);
          done();
        });

    });

  });

  describe('all', function () {

    it('should return an object of all cached items', function () {
      let context = new ExtensionContext();
      let cache = new Cache(context);
      let all = {
        foo1: 'bar1',
        foo2: 'bar2'
      }
      return cache.put('foo1', 'bar1')
        .then(function () {
          return cache.put('foo2', 'bar2', 10);
        })
        .then(function () {
          assert.deepEqual(cache.all(), all);
        });
    });

    it('should return an empty object if there are no cache items', function () {
      let context = new ExtensionContext();
      let cache = new Cache(context);
      assert.deepEqual(cache.all(), {});
    });

  });

  describe('flush', function () {

    it('should empty the cache', function () {
      let context = new ExtensionContext();
      let cache = new Cache(context);
      return cache.put('foo', 'bar')
        .then(function () {
          assert.notDeepEqual(cache.all(), {});
          return cache.flush();
        })
        .then(function () {
          assert.deepEqual(cache.all(), {});
        });
    });

  });

  describe('getExpiration', function () {

    it('should return the expiration for an item with an expiration', function () {
      let context = new ExtensionContext();
      let cache = new Cache(context);
      let now = Math.floor(Date.now() / 1000);
      let lifetime = 10;
      let key = 'foo';
      return cache.put(key, 'bar', lifetime)
        .then(function () {
          assert.equal(cache.getExpiration(key), now + lifetime);
        });
    });

    it('should return undefined for an item without an expiration', function () {
      let context = new ExtensionContext();
      let cache = new Cache(context);
      let key = 'foo';
      return cache.put(key, 'bar')
        .then(function () {
          assert.equal(typeof (cache.getExpiration(key)), 'undefined');
        });
    });

    it('should return undefined for a non-existent item', function () {
      let context = new ExtensionContext();
      let cache = new Cache(context);
      assert.equal(typeof (cache.getExpiration('foo')), 'undefined');
    });

  });

  describe('isExpired', function () {

    it('should return true if an item is expired', function (done) {
      this.timeout(3000);
      let context = new ExtensionContext();
      let cache = new Cache(context);
      let lifetime = 1;
      let key = 'foo';
      cache.put(key, 'bar', lifetime)
        .then(function () {
          setTimeout(function () {
            assert.ok(cache.isExpired(key));
            done();
          }, 2000);
        });
    });

    it('should return false if an item is not expired', function () {
      this.timeout(3000);
      let context = new ExtensionContext();
      let cache = new Cache(context);
      let lifetime = 1;
      let key = 'foo';
      return cache.put(key, 'bar', lifetime)
        .then(function () {
          assert.ok(!cache.isExpired(key));
        });
    });

    it('should return false an item does not expire', function () {
      let context = new ExtensionContext();
      let cache = new Cache(context);
      let key = 'foo';
      return cache.put(key, 'bar')
        .then(function () {
          assert.ok(!cache.isExpired(key));
        });
    });

    it('should return false a key does not exist', function () {
      let context = new ExtensionContext();
      let cache = new Cache(context);
      assert.ok(!cache.isExpired('foo'));
    });

  });

});
