var assert = require("assert");
var app = require('express')();
var _ = require('underscore')._;
var paymentFactory = require('../factories/paymentModuleFactory');

describe('Payment module', function(){
  it('should throw an error when an unknown bankId is given to a parameter generating function', function(){
    var payments = paymentFactory.create();
    var unknownBank = 'korhopankki';
    _.each([
      function () { payments.buildRequestParams(unknownBank, {}); },
      function () { payments.paymentButton(unknownBank, {}); },
      function () { payments.buildStatusQueryParams(unknownBank, {} ); }
    ], function (f) {
      assert.throws(f, /No configuration found for bank id 'korhopankki'/);
    });
  });
});