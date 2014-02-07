var assert = require("assert");
var paymentFactory = require('../factories/paymentModuleFactory');
var crypto = require('crypto');

describe('Payment status query for Nordea: ', function () {
  it('parameter generation should return an object with the right parameters', function () {
    var payment = paymentFactory.create();
    var requestId = '2014020712293512345';
    var timeStamp = '201402071229351';
    var reference = payment.referenceNumbers.toFinnishPaymentReference(requestId);
    var params = payment.buildStatusQueryParams('nordea', {
      requestId: requestId,
      reference: reference,
      timeStamp: timeStamp,
      language: 'SV'
    });
    var macParams = ["0001", timeStamp, "12345678", 2, requestId, reference, 'EUR', "0001", "01", "LEHTI"].join("&") + "&";
    var mac = crypto.createHash('md5').update(macParams).digest('hex').toUpperCase();

    assert.equal("0001", params.SOLOPMT_VERSION);
    assert.equal(timeStamp, params.SOLOPMT_TIMESTMP);
    assert.equal("12345678", params.SOLOPMT_RCV_ID);
    assert.equal(2, params.SOLOPMT_LANGUAGE);
    assert.equal(undefined, params.SOLOPMT_RESPTYPE);
    assert.equal(undefined, params.SOLOPMT_RESPDETL);
    assert.equal(requestId, params.SOLOPMT_STAMP);
    assert.equal(reference, params.SOLOPMT_REF);
    assert.equal(undefined, params.SOLOPMT_AMOUNT);
    assert.equal('EUR', params.SOLOPMT_CUR);
    assert.equal("0001", params.SOLOPMT_KEYVERS);
    assert.equal("01", params.SOLOPMT_ALG);
    assert.equal(mac, params.SOLOPMT_MAC);
  });
});