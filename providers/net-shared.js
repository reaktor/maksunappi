var formatting = require('../format');
var parameters = require('../parameters');
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

var RETURN_MAC_PARAMS = [
  'NET_RETURN_VERSION',
  'NET_RETURN_STAMP',
  'NET_RETURN_REF',
  'NET_RETURN_PAID',
  'NET_ALG'
];

exports.mapParams = function (providerConfig, options) {
  validateParams(providerConfig, options);

  return {
    "NET_VERSION" : formatting.formatVersionNumber(providerConfig.paymentVersion, 3),
    "NET_STAMP" : options.requestId,
    "NET_SELLER_ID" : providerConfig.vendorId,
    "NET_AMOUNT" : formatting.formatAmount(options.amount),
    "NET_CUR" : providerConfig.currency,
    "NET_REF" : options.reference,
    "NET_DATE" : providerConfig.dueDate,
    "NET_MSG" : formatting.formatMessage(options.messageOnlyForWebForm),
    "NET_RETURN" : providerConfig.returnUrls.ok.url,
    "NET_CANCEL" : providerConfig.returnUrls.cancel,
    "NET_REJECT" : providerConfig.returnUrls.reject,
    "NET_CONFIRM" : formatting.formatBoolean(providerConfig.confirm),
    "NET_ALG" : formatAlgorithm(providerConfig)
  };
};

function validateParams (providerConfig, options) {
  parameters.requireParams(options, ['requestId', 'amount', 'reference']);
  parameters.requireParams(providerConfig,
    ['paymentVersion', 'vendorId', 'currency', 'dueDate', 'returnUrls', 'confirm']);

  parameters.requireInclusionIn(providerConfig, 'dueDate', ['EXPRESS']);
}

exports.algorithmType = function (bankConfig) {
  if (parseInt(bankConfig.paymentVersion) == 3) {
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
  return parameters.macParams(queryParams, RETURN_MAC_PARAMS, [], [providerConfig.checksumKey]);
};

function macParamsForVersion(paymentVersion) {
  switch (parseInt(paymentVersion)) {
    case 1: return MAC_VERSION1;
    case 2: return MAC_VERSION2;
    case 3: return MAC_VERSION3;
    default: throw new Error("Unknown payment version '" + paymentVersion + "'.");
  }
}

exports.macFormName = 'NET_MAC';

function formatAlgorithm (bankConfig) {
  return exports.algorithmType(bankConfig) === "sha256" ? "03" : undefined;
}

exports.isMyQuery = function (query) {
  return _.keys(query)[0].match(/^NET/);
};

exports.renameQueryParams = function (query) {
  return {
    version: parseInt(query.NET_RETURN_VERSION),
    requestId: query.NET_RETURN_STAMP,
    reference: query.NET_RETURN_REF,
    archivedId: query.NET_RETURN_PAID,
    mac: query.NET_RETURN_MAC,
    algorithm: parseInt(query.NET_ALG)
  };
};