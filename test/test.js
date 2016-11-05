const assert = require('assert');
const ExtensionContext = require('./ExtensionContextMock');
const Cache = require('../index.js');

// Test ExtensionContext Mock
describe('ExtensionContextMock', () => {

  describe('globalState.update()', () => {

    it('should return true when updating a value', () => {
      let context = new ExtensionContext();
      context.globalState.update('foo', 'bar')
        .then((value) => {
          assert.equal(value, true);
        });
    });

    it('should return true when updating value with undefined', () => {
      let context = new ExtensionContext();
      context.globalState.update('foo', undefined)
        .then((value) => {
          assert.equal(value, true);
        });
    });

  });

  describe('globalState.get()', () => {

    it('should return the value when getting the value', () => {
      let context = new ExtensionContext();
      context.globalState.update('foo', 'bar')
        .then((value) => {
          assert.equal(context.globalState.get('foo'), 'bar');
        });
    });

  });

});
