var formatting = require('../format');
var parameters = require('../parameters');
var helpers = require('../helpers');
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

exports.mapParams = function (options) {
  validateParams(options);

  return {
    "AAB_VERSION" : formatVersion(options.paymentVersion),
    "AAB_STAMP" : options.requestId,
    "AAB_RCV_ID" : options.vendorId,
    "AAB_RCV_ACCOUNT" : options.vendorAccount,
    "AAB_RCV_NAME" : options.vendorName,
    "AAB_LANGUAGE" : formatting.formatLanguage(options.language, formatting.languageFormats.mapEnglishToDefault),
    "AAB_AMOUNT" : formatting.formatAmount(options.amount),
    "AAB_REF" : options.reference,
    "AAB_DATE" : formatting.formatDueDate(options.dueDate),
    "AAB_MSG" : formatting.formatMessage(options.messageForWebForm),
    "AAB_RETURN" : options.returnUrls.ok.url,
    "AAB_CANCEL" : options.returnUrls.cancel,
    "AAB_REJECT" : options.returnUrls.reject,
    "AAB_CONFIRM" : formatting.formatBoolean(options.confirm),
    "AAB_KEYVERS" : formatVersion(options.keyVersion),
    "AAB_CUR" : options.currency
  };
};

function formatVersion(versionNumber) {
  return formatting.formatVersionNumber(versionNumber, 4);
}

function validateParams (options) {
  parameters.requireParams(options, ['requestId', 'amount', 'reference',
    'paymentVersion', 'vendorId', 'vendorAccount', 'vendorName',
    'dueDate', 'currency', 'returnUrls', 'confirm', 'keyVersion', 'language']);

  parameters.requireInclusionIn(options, 'dueDate', ['EXPRESS']);
  parameters.requireLengthMax(options, 'requestId', 15);
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

exports.renameQueryParams = function (query) {
  return {
    version: helpers.toIntOrUndefined(query["AAB-RETURN-VERSION"]),
    requestId: query["AAB-RETURN-STAMP"],
    reference: query["AAB-RETURN-REF"],
    archivedId: query["AAB-RETURN-PAID"],
    mac: query["AAB-RETURN-MAC"]
  };
};