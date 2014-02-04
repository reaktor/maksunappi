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

describe('Parameter maximum length validation', function () {
  it('should throw when parameter value length exceeds the given maximum length', function () {
    assert.throws(function () {
      params.requireLengthMax({ 'foo' : 'abc' }, 'foo', 2);
    }, /foo is too long: 'abc' \(maximum length 2\)/);
  });

  it('should use the parameter name for messages in the error message (if specified)', function () {
    assert.throws(function () {
      params.requireLengthMax({ 'foo' : 'abc' }, 'foo', 2, 'Custom parameter name');
    }, /Custom parameter name is too long/);
  });

  it('should not throw when parameter value length is smaller than or equal to the given maximum length', function () {
    assert.doesNotThrow(function () {
      var parameters = { 'foo' : 'abc' };
      params.requireLengthMax(parameters, 'foo', 5);
      params.requireLengthMax(parameters, 'foo', 3);
    });
  });

  it('should not throw when parameter is not present', function () {
    assert.doesNotThrow(function () {
      params.requireLengthMax({ }, 'foo', 5);
    });
  });
});

describe('Parameter minimum length validation', function () {
  it('should throw when parameter value length is below the given minimum length', function () {
    assert.throws(function () {
      params.requireLengthMin({ 'foo' : 'abc' }, 'foo', 4);
    }, /foo is too short: 'abc' \(minimum length 4\)/);
  });

  it('should use the parameter name for messages in the error message (if specified)', function () {
    assert.throws(function () {
      params.requireLengthMin({ 'foo' : 'abc' }, 'foo', 4, 'Custom parameter name');
    }, /Custom parameter name is too short/);
  });

  it('should not throw when parameter value length is greater than or equal to the given maximum length', function () {
    assert.doesNotThrow(function () {
      var parameters = { 'foo' : 'abc' };
      params.requireLengthMin(parameters, 'foo', 2);
      params.requireLengthMin(parameters, 'foo', 3);
    });
  });

  it('should not throw when parameter is not present', function () {
    assert.doesNotThrow(function () {
      params.requireLengthMin({ }, 'foo', 5);
    });
  });
});