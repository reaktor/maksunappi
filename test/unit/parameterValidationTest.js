var assert = require("assert");
var payment = require("../../payment");
var params = require('../../parameters');

describe('The online payments module', function () {
  it('should throw if appHandler is missing', function () {
    assert.throws(function () {
      payment.create({ hostUrl: 'https://localhost:8000'});
    }, /Missing required argument 'appHandler'/);
  });

  it('should throw if hostUrl is missing', function () {
    assert.throws(function () {
      payment.create({ appHandler: {}});
    }, /Missing required argument 'hostUrl'/);
  });
});

describe('Parameter requirement validation', function () {
  it('should throw if a required parameter is missing', function () {
    assert.throws(function () {
      params.requireParams({}, ['foo']);
    }, /Missing required argument 'foo'/);
    assert.throws(function () {
      params.requireParams({ 'foo' : 1, 'bar' : "" }, ['foo', 'bar']);
    }, /Missing required argument 'bar'/);
    assert.throws(function () {
      params.requireParams({ 'foo' : null }, ['foo']);
    }, /Missing required argument 'foo'/);
  });

  it('should not throw for other falsy values than null, undefined and empty string', function () {
    assert.doesNotThrow(function () {
      params.requireParams({ 'foo' : false, 'bar' : [] }, ['foo', 'bar']);
    });
  });

  it('should not throw if all required values are provided', function () {
    assert.doesNotThrow(function () {
      params.requireParams({ 'foo' : 1, 'bar' : 'how much wood would a woodchuch chuck' }, ['foo', 'bar']);
    });
  });
});

describe('Parameter inclusion validation', function () {
  it('should throw when parameter value is not in the list of allowed values', function () {
    assert.throws(function () {
      params.requireInclusionIn({ 'foo' : 1 }, 'foo', [0, 2, 3, 4, 5]);
    }, /Unsupported value for 'foo': '1'/);
  });

  it('should throw when the expected parameter is not present', function () {
    assert.throws(function () {
      params.requireInclusionIn({}, 'foo', [0, 2, 3, 4, 5]);
    }, /Unsupported value for 'foo': 'undefined'/);
  });

  it('should not throw when parameter value is in the allowed list', function () {
    assert.doesNotThrow(function () {
      params.requireInclusionIn({ 'foo' : 1 }, 'foo', [0, 1, 2, 3, 4]);
    });
  });
});