var formatting = require('../format');
var parameters = require('../parameters');
var _ = require('underscore')._;

var MAC_PARAMS = [
  'AAB_VERSION',
  'AAB_STAMP',
  'AAB_RCV_ID',
  'AAB_AMOUNT',
  'AAB_REF',
  'AAB_DATE',
  'AAB_CUR'
];

var RETURN_MAC_PARAMS = [
  'AAB-RETURN-VERSION',
  'AAB-RETURN-STAMP',
  'AAB-RETURN-REF',
  'AAB-RETURN-PAID'
];

exports.mapParams = function (providerConfig, options) {
  validateParams(providerConfig, options);

  return {
    "AAB_VERSION" : formatVersion(providerConfig.paymentVersion),
    "AAB_STAMP" : options.requestId,
    "AAB_RCV_ID" : providerConfig.vendorId,
    "AAB_RCV_ACCOUNT" : providerConfig.vendorAccount,
    "AAB_RCV_NAME" : providerConfig.vendorName,
    "AAB_LANGUAGE" : formatting.formatLanguage(options.language, formatting.languageFormats.mapEnglishToDefault),
    "AAB_AMOUNT" : formatting.formatAmount(options.amount),
    "AAB_REF" : options.reference,
    "AAB_DATE" : providerConfig.dueDate,
    "AAB_MSG" : formatting.formatMessage(options.messageOnlyForWebForm),
    "AAB_RETURN" : providerConfig.returnUrls.ok.url,
    "AAB_CANCEL" : providerConfig.returnUrls.cancel,
    "AAB_REJECT" : providerConfig.returnUrls.reject,
    "AAB_CONFIRM" : formatting.formatBoolean(providerConfig.confirm),
    "AAB_KEYVERS" : formatVersion(providerConfig.keyVersion),
    "AAB_CUR" : providerConfig.currency
  };
};

function formatVersion(versionNumber) {
  return formatting.formatVersionNumber(versionNumber, 4);
}

function validateParams (providerConfig, options) {
  parameters.requireParams(options, ['requestId', 'amount', 'reference']);
  parameters.requireParams(providerConfig,
    ['paymentVersion', 'vendorId', 'vendorAccount', 'vendorName',
      'dueDate', 'currency', 'returnUrls', 'confirm', 'keyVersion', 'language']);

  parameters.requireInclusionIn(providerConfig, 'dueDate', ['EXPRESS']);
  parameters.requireLengthMax(options, 'requestId', 15);
  parameters.requireLengthMax(options, 'reference', 20);
  parameters.requireLengthMax(options, 'messageOnlyForWebForm', 245);
  parameters.requireLengthBetween(providerConfig, 'vendorId', 8, 15);
  parameters.requireLengthMax(providerConfig, 'vendorAccount', 34);
  parameters.requireLengthMax(providerConfig, 'vendorName', 15);
  parameters.requireLengthMax(providerConfig, 'currency', 3);
  parameters.requireUrlLengthMax(providerConfig.returnUrls, 199);
}

exports.algorithmType = function (bankConfig) {
  return bankConfig.algorithmType;
};

exports.requestMacParams = function (providerConfig, formParams) {
  return parameters.macParams(formParams, MAC_PARAMS, [], [providerConfig.checksumKey]);
};

exports.returnMacParams = function (providerConfig, queryParams) {
  return parameters.macParams(queryParams, RETURN_MAC_PARAMS, [], [providerConfig.checksumKey]);
};

exports.macFormName = 'AAB_MAC';

exports.isMyQuery = function (query) {
  return _.keys(query)[0].match(/^AAB/);
};

exports.renameQueryParams = function (query) {
  return {
    version: parseInt(query["AAB-RETURN-VERSION"]),
    requestId: query["AAB-RETURN-STAMP"],
    reference: query["AAB-RETURN-REF"],
    archivedId: query["AAB-RETURN-PAID"],
    mac: query["AAB-RETURN-MAC"]
  };
};