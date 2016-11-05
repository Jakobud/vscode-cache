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
