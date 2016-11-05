'use strict';

const Promise = require('bluebird');

let ExtensionContextMock = function () { }

ExtensionContextMock.prototype.globalState = function () {

}

ExtensionContextMock.prototype.globalState.get = function (key, defaultValue) {

  // If key does not exist
  if (typeof (this[key]) === 'undefined') {

    // If default value is provided
    if (typeof (defaultValue) !== 'undefined') {
      return defaultValue;
    } else {
      return undefined;
    }

  } else {

    return this[key];

  }
}

ExtensionContextMock.prototype.globalState.update = function (key, value) {
  this[key] = value;

  return new Promise((resolve, reject) => {
    resolve(true);
  });
}

module.exports = ExtensionContextMock;