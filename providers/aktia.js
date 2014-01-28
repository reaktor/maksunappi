var formatting = require('../format');
var parameters = require('../parameters');

// Should be used with payment version 001.
var MAC_VERSION1 = [
  'NET_VERSION',
  'NET_STAMP',
  'NET_SELLER_ID',
  'NET_AMOUNT',
  'NET_REF',
  'NET_DATE',
  'NET_CUR'
];
// Should be used with payment version 002.
var MAC_VERSION2 = MAC_VERSION1.concat([
  'NET_RETURN',
  'NET_CANCEL',
  'NET_REJECT'
]);
// Used with payment version 003 (default).
var MAC_VERSION3 = MAC_VERSION2.concat(['NET_ALG']);

exports.mapParams = function (providerConfig, options) {
  // TODO: check params
  // Note: different parameters might be required in different payment versions.

  return {
    "NET_VERSION" : providerConfig.paymentVersion,
    "NET_STAMP" : options.requestId,
    "NET_SELLER_ID" : providerConfig.vendorId,
    "NET_AMOUNT" : formatting.formatAmount(options.amount),
    "NET_CUR" : providerConfig.currency,
    "NET_REF" : formatting.formatToPaymentReference(options.requestId),
    "NET_DATE" : providerConfig.dueDate,
    "NET_MSG" : formatting.formatMessage(options.message),
    "NET_RETURN" : providerConfig.returnUrls.ok,
    "NET_CANCEL" : providerConfig.returnUrls.cancel,
    "NET_REJECT" : providerConfig.returnUrls.reject,
    "NET_CONFIRM" : providerConfig.confirm,
    "NET_ALG" : "03"
  };
};

exports.algorithmType = function (bankConfig) {
  if (bankConfig.paymentVersion == "003") {
    return "sha256";
  } else {
    return "md5";
  }
};

exports.requestMacParams = function () {
  return MAC_VERSION3;
};

exports.macFormName = 'NET_MAC';