var formatting = require('../format');
var parameters = require('../parameters');
var helpers = require('../helpers');
var _ = require('underscore')._;

var MAC_VERSION1 = [
  'NET_VERSION',
  'NET_STAMP',
  'NET_SELLER_ID',
  'NET_AMOUNT',
  'NET_REF',
  'NET_DATE',
  'NET_CUR'
];
var MAC_VERSION2 = MAC_VERSION1.concat([
  'NET_RETURN',
  'NET_CANCEL',
  'NET_REJECT'
]);
var MAC_VERSION3 = MAC_VERSION2.concat(['NET_ALG']);
var MAC_VERSION10 = MAC_VERSION3.concat(['NET_KEYVERS']);
var RETURN_MAC_PARAMS = [
  'NET_RETURN_VERSION',
  'NET_RETURN_STAMP',
  'NET_RETURN_REF',
  'NET_RETURN_PAID',
  'NET_ALG'
];

var RETURN_MAC_PARAMS10 = [
  'NET_RETURN_VERSION',
  'NET_ALG',
  'NET_RETURN_STAMP',
  'NET_RETURN_REF',
  'NET_RETURN_PAID',
  'NET_KEYVERS'
];

exports.mapParams = function (options) {
  validateParams(options);

  return {
    "NET_VERSION" : formatting.formatVersionNumber(options.paymentVersion, 3),
    "NET_STAMP" : options.requestId,
    "NET_SELLER_ID" : options.vendorId,
    "NET_AMOUNT" : formatting.formatAmount(options.amount),
    "NET_CUR" : options.currency,
    "NET_REF" : options.reference,
    "NET_DATE" : formatting.formatDueDate(options.dueDate),
    "NET_MSG" : formatting.formatMessage(options.messageForWebForm),
    "NET_RETURN" : options.returnUrls.ok.url,
    "NET_CANCEL" : options.returnUrls.cancel,
    "NET_REJECT" : options.returnUrls.reject,
    "NET_CONFIRM" : formatting.formatBoolean(options.confirm),
    "NET_ALG" : formatAlgorithm(options),
    "NET_KEYVERS" : formatting.formatVersionNumber(options.keyVersion, 4)
  };
};

function validateParams (options) {
  parameters.requireParams(options, ['requestId', 'amount', 'reference',
    'paymentVersion', 'vendorId', 'currency', 'dueDate', 'returnUrls', 'confirm']);

  parameters.requireInclusionIn(options, 'dueDate', ['EXPRESS']);
}

exports.algorithmType = function (bankConfig) {
  var paymentVersion = parseInt(bankConfig.paymentVersion);
  if (paymentVersion == 3 || paymentVersion == 10 ) {
    return "sha256";
  } else {
    return "md5";
  }
};

exports.requestMacParams = function (providerConfig, formParams) {
  var macParams = macParamsForVersion(providerConfig.paymentVersion);
  return parameters.macParams(formParams, macParams, [], [providerConfig.checksumKey]);
};

exports.returnMacParams = function (providerConfig, queryParams) {
  var returnMacParams = macReturnParamsForVersion(providerConfig.paymentVersion);
  return parameters.macParams(queryParams, returnMacParams, [], [providerConfig.checksumKey]);
};

function macReturnParamsForVersion(paymentVersion) {
  switch (parseInt(paymentVersion)) {
    case 10: return RETURN_MAC_PARAMS10;
    default: return RETURN_MAC_PARAMS;
  }
}
function macParamsForVersion(paymentVersion) {
  switch (parseInt(paymentVersion)) {
    case 1: return MAC_VERSION1;
    case 2: return MAC_VERSION2;
    case 3: return MAC_VERSION3;
    case 10: return MAC_VERSION10;
    default: throw new Error("Unknown payment version '" + paymentVersion + "'.");
  }
}

exports.macFormName = 'NET_MAC';

function formatAlgorithm (bankConfig) {
  return exports.algorithmType(bankConfig) === "sha256" ? "03" : undefined;
}

exports.renameQueryParams = function (query) {
  return {
    version: helpers.toIntOrUndefined(query.NET_RETURN_VERSION),
    requestId: query.NET_RETURN_STAMP,
    reference: query.NET_RETURN_REF,
    archivedId: query.NET_RETURN_PAID,
    mac: query.NET_RETURN_MAC,
    algorithm: helpers.toIntOrUndefined(query.NET_ALG)
  };
};