var assert = require("assert");
var payment = require("../../payment");

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