import createMockExtensionContext from './createMockExtensionContext';
import { describe, expect, jest, test } from '@jest/globals';
import Cache from "../src/index";



describe('Cache', () => {
  let context: any;
  let cache: Cache;

  beforeEach(() => {
    context = createMockExtensionContext();
    cache = new Cache(context);
  });

  describe('put', () => {
    test(`Stores a string value`, () => {
      cache.put('foo', 'bar')
      expect(cache.get('foo')).toEqual('bar');
    });

    test(`Stores a number value`, () => {
      cache.put('foo', 123)
      expect(cache.get('foo')).toEqual(123);
    });

    test(`Stores a boolean value`, () => {
      cache.put('foo', true)
      expect(cache.get('foo')).toEqual(true);
    });

    test(`Stores an object value`, () => {
      cache.put('foo', { bar: 'baz' })
      expect(cache.get('foo')).toEqual({ bar: 'baz' });
    });

    test(`Stores an array value`, () => {
      cache.put('foo', ['bar', 'baz'])
      expect(cache.get('foo')).toEqual(['bar', 'baz']);
    });

    test(`Accepts only string key`, () => {
      cache.put(123 as any, 'test');
      expect(cache.get(123 as any)).toEqual(undefined);
      cache.put(true as any, 'test');
      expect(cache.get(true as any)).toEqual(undefined);
      cache.put({} as any, 'test');
      expect(cache.get({} as any)).toEqual(undefined);
      cache.put([] as any, 'test');
      expect(cache.get([] as any)).toEqual(undefined);
    });

    test(`Will set an expiration`, () => {
      const expiration = 1000;
      cache.put('foo', 'bar', expiration)
      expect(cache.get('foo')).toEqual('bar');
      expect(cache.getExpiration('foo')).toBeGreaterThan(Date.now());
    });

    test(`Will not set expiration if not provided`, () => {
      cache.put('foo', 'bar')
      expect(cache.get('foo')).toEqual('bar');
      expect(cache.getExpiration('foo')).toEqual(undefined);
    });

    test(`Will not set a non-numeric expiration`, () => {
      cache.put('foo', 'bar', 'not a number' as any)
      expect(cache.get('foo')).toEqual('bar');
      expect(cache.getExpiration('foo')).toEqual(undefined);
    });

    test(`Will not set expiration in the past`, () => {
      const expiration = -1000;
      cache.put('foo', 'bar', expiration)
      expect(cache.get('foo')).toEqual('bar');
      expect(cache.getExpiration('foo')).toEqual(undefined);
    });

    test(`Will overwrite existing values`, () => {
      cache.put('foo', 'bar')
      expect(cache.get('foo')).toEqual('bar');
      cache.put('foo', 'baz')
      expect(cache.get('foo')).toEqual('baz');
    });

    test(`Returns "this"`, () => {
      expect(cache.put('foo', 'bar')).toEqual(cache);
    });

    test(`Is chainable`, () => {
      cache.put('foo', 'bar').put('baz', 'qux');
      expect(cache.get('foo')).toEqual('bar');
      expect(cache.get('baz')).toEqual('qux');
    });
  });

  describe('get', () => {
    test(`Returns a string value`, () => {
      cache.put('foo', 'bar')
      expect(cache.get('foo')).toEqual('bar');
    });

    test(`Returns a number value`, () => {
      cache.put('foo', 123)
      expect(cache.get('foo')).toEqual(123);
    });

    test(`Returns a boolean value`, () => {
      cache.put('foo', true)
      expect(cache.get('foo')).toEqual(true);
    });

    test(`Returns an object value`, () => {
      cache.put('foo', { bar: 'baz' })
      expect(cache.get('foo')).toEqual({ bar: 'baz' });
    });

    test(`Returns an array value`, () => {
      cache.put('foo', ['bar', 'baz'])
      expect(cache.get('foo')).toEqual(['bar', 'baz']);
    });

    test(`Returns undefined if the key does not exist`, () => {
      expect(cache.get('foo')).toEqual(undefined);
    });

    test(`Returns a default value if the key does not exist`, () => {
      expect(cache.get('foo', 'bar')).toEqual('bar');
    });

    test(`Returns the stored value if a default is provided`, () => {
      cache.put('foo', 'bar')
      expect(cache.get('foo', 'baz')).toEqual('bar');
    });

    test(`Returns undefined if expired`, () => {
      const expiration = 1000;
      cache.put('foo', 'bar', expiration);

      jest.useFakeTimers();

      setTimeout(() => {
        expect(cache.get('foo')).toEqual(undefined);
      }, 2000);

      jest.advanceTimersByTime(3000);
      jest.useRealTimers();
    });

    test(`Returns default value if expired`, () => {
      const expiration = 1000;
      cache.put('foo', 'bar', expiration);

      jest.useFakeTimers();

      setTimeout(() => {
        expect(cache.get('foo', 'baz')).toEqual('baz');
      }, 2000);

      jest.advanceTimersByTime(3000);
      jest.useRealTimers();
    });
  });

  describe('setExpiration', () => {
    test(`Sets expiration`, () => {
      const expiration = 1000;
      cache.put('foo', 'bar');
      cache.setExpiration('foo', expiration);
      expect(cache.getExpiration('foo')).toBeGreaterThan(Date.now());
    });

    test(`Does not set expiration if key does not exist`, () => {
      const expiration = 1000;
      cache.setExpiration('foo', expiration);
      expect(cache.getExpiration('foo')).toEqual(undefined);
    });

    test(`Does not set non-numeric expirations`, () => {
      cache.setExpiration('foo', 'not a number' as any);
      expect(cache.getExpiration('foo')).toEqual(undefined);
    });

    test(`Does not set expirations in the past`, () => {
      const expiration = -1000;
      cache.setExpiration('foo', expiration);
      expect(cache.getExpiration('foo')).toEqual(undefined);
    });

    test(`Returns "this"`, () => {
      cache.put('foo', 'bar');
      expect(cache.setExpiration('foo', Date.now() + 1000)).toEqual(cache);
    });

    test(`Is chainable`, () => {
      cache.put('foo', 'bar').setExpiration('foo', 1000).put('baz', 'qux').setExpiration('baz', 1000);
      expect(cache.get('foo')).toEqual('bar');
      expect(cache.get('baz')).toEqual('qux');
    });

    test(`Will overwrite existing expiration`, () => {
      const expiration = 1000;
      cache.put('foo', 'bar', expiration);
      cache.setExpiration('foo', expiration + 1000);
      expect(cache.getExpiration('foo')).toBeGreaterThan(Date.now() + 1000);
    });
  });

  describe('setAbsoluteExpiration', () => {
    test(`Sets an expiration relative to Date.now()`, () => {
      cache.put('foo', 'bar');
      cache.setAbsoluteExpiration('foo', Date.now() + 1000);
      expect(cache.getExpiration('foo')).toBeGreaterThan(Date.now());
    });

    test(`Does not set expiration if key does not exist`, () => {
      cache.setAbsoluteExpiration('foo', Date.now() + 1000);
      expect(cache.getExpiration('foo')).toEqual(undefined);
    });

    test(`Does not set non-numeric expirations`, () => {
      cache.setAbsoluteExpiration('foo', 'not a number' as any);
      expect(cache.getExpiration('foo')).toEqual(undefined);
    });
  });

  describe('getExpiration', () => {
    test(`Returns expiration`, () => {
      const expiration = 1000;
      cache.put('foo', 'bar', expiration);
      expect(cache.getExpiration('foo')).toBeGreaterThan(Date.now());
    });

    test(`Returns undefined if key does not exist`, () => {
      expect(cache.getExpiration('foo')).toEqual(undefined);
    });

    test(`Returns undefined if key has no expiration`, () => {
      cache.put('foo', 'bar');
      expect(cache.getExpiration('foo')).toEqual(undefined);
    });

    test(`Returns undefined if expired`, () => {
      const expiration = 1000;
      cache.put('foo', 'bar', expiration);

      jest.useFakeTimers();

      setTimeout(() => {
        expect(cache.getExpiration('foo')).toEqual(undefined);
      }, 2000);

      jest.advanceTimersByTime(3000);
      jest.useRealTimers();
    });
  });

  describe('isExpired', () => {
    test(`Returns false if key does not exist`, () => {
      expect(cache.isExpired('foo')).toEqual(false);
    });

    test(`Returns false if key has no expiration`, () => {
      cache.put('foo', 'bar');
      expect(cache.isExpired('foo')).toEqual(false);
    });

    test(`Returns false if expiration is in the future`, () => {
      const expiration = 1000;
      cache.put('foo', 'bar', expiration);
      expect(cache.isExpired('foo')).toEqual(false);
    });
  });

  describe('has', () => {
    test(`Returns true if key exists`, () => {
      cache.put('foo', 'bar');
      expect(cache.has('foo')).toEqual(true);
    });

    test(`Returns false if key does not exist`, () => {
      expect(cache.has('foo')).toEqual(false);
    });

    test(`Returns false if expired`, () => {
      const expiration = 1000;
      cache.put('foo', 'bar', expiration);

      jest.useFakeTimers();

      setTimeout(() => {
        expect(cache.has('foo')).toEqual(false);
      }, 2000);

      jest.advanceTimersByTime(3000);
      jest.useRealTimers();
    });
  });

  describe('forget', () => {
    test(`Removes key from cache`, () => {
      cache.put('foo', 'bar');
      cache.forget('foo');
      expect(cache.get('foo')).toEqual(undefined);
    });

    test(`Does nothing if key does not exist`, () => {
      cache.forget('foo');
      expect(cache.get('foo')).toEqual(undefined);
    });

    test(`Removes key if item is expired`, () => {
      cache.put('foo', 'bar', 1000);

      jest.useFakeTimers();

      setTimeout(() => {
        cache.forget('foo');
        expect(cache.get('foo')).toEqual(undefined);
      }, 2000);

      jest.advanceTimersByTime(3000);
      jest.useRealTimers();
    });

    test(`Returns "this"`, () => {
      cache.put('foo', 'bar');
      expect(cache.forget('foo')).toEqual(cache);
    });

    test(`Is chainable`, () => {
      cache.put('foo', 'bar').forget('foo').put('baz', 'qux');
      expect(cache.get('foo')).toEqual(undefined);
      expect(cache.get('baz')).toEqual('qux');
    });
  });

  describe('flush', () => {
    test(`Removes all keys`, () => {
      cache.put('foo', 'bar').put('baz', 'qux');
      cache.flush();
      expect(cache.get('foo')).toEqual(undefined);
      expect(cache.get('baz')).toEqual(undefined);
    });

    test(`Returns "this"`, () => {
      expect(cache.flush()).toEqual(cache);
    });

    test(`Is chainable`, () => {
      cache.put('foo', 'bar').put('baz', 'qux').flush().put('quux', 'corge');
      expect(cache.get('foo')).toEqual(undefined);
      expect(cache.get('baz')).toEqual(undefined);
      expect(cache.get('quux')).toEqual('corge');
    });
  });

  describe('keys', () => {
    test(`Returns an array of keys`, () => {
      cache.put('foo', 'bar').put('baz', 'qux');
      expect(cache.keys()).toEqual(['foo', 'baz']);
    });

    test(`Returns an empty array if no keys`, () => {
      expect(cache.keys()).toEqual([]);
    });
  });

  describe('all', () => {
    test(`Returns an object of all keys and values`, () => {
      cache.put('foo', 'bar').put('baz', 'qux');
      expect(cache.all()).toEqual({ foo: 'bar', baz: 'qux' });
    });

    test(`Returns an empty object if no keys`, () => {
      expect(cache.all()).toEqual({});
    });
  });
});
