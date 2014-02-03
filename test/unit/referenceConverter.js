var _ = require('underscore')._;
var assert = require("assert");
var converter = require("../../referenceConverter");

describe('Payment reference converter', function(){
  it('should convert series of numbers to valid finnish referenceFormat', function(){
    assert.equal(12345672, converter.toFinnishPaymentReference(1234567));
    assert.equal(13, converter.toFinnishPaymentReference(1));
    assert.equal(110, converter.toFinnishPaymentReference(11));
    assert.equal("2014012911041312349", converter.toFinnishPaymentReference("201401291104131234"));
  });

  it('should convert finnish reference to rf reference', function(){
    assert.equal("RF332348236", converter.toRFReference(2348236));
    assert.equal("RF07123912", converter.toRFReference(123912));
    assert.equal("RF75201401291104131234", converter.toRFReference("201401291104131234"));
  });
});