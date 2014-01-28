var assert = require("assert");
var formatter = require("../../format");
describe('Payment reference format', function(){
  it('should convert series of numbers to valid referenceFormat', function(){
    assert.equal(12345672, formatter.formatToPaymentReference(1234567));
    assert.equal(13, formatter.formatToPaymentReference(1));
  });
});