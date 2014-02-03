var _ = require('underscore')._;
var assert = require("assert");
var converter = require("../../referenceConverter");

describe('Payment reference converter', function(){
  it('should convert series of numbers to valid referenceFormat', function(){
    assert.equal(12345672, converter.toFinnishPaymentReference(1234567));
    assert.equal(13, converter.toFinnishPaymentReference(1));
    assert.equal(110, converter.toFinnishPaymentReference(11));
    assert.equal("2014012911041312349", converter.toFinnishPaymentReference("201401291104131234"));
  });
});