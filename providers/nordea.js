var formatting = require('../format');
var parameters = require('../parameters');
var helpers = require('../helpers');
var _ = require('underscore')._;

var MAC_PARAMS = [
  'SOLOPMT_VERSION',
  'SOLOPMT_STAMP',
  'SOLOPMT_RCV_ID',
  'SOLOPMT_AMOUNT',
  'SOLOPMT_REF',
  'SOLOPMT_DATE',
  'SOLOPMT_CUR'
];

var RETURN_MAC_PARAMS = [
  'SOLOPMT_RETURN_VERSION',
  'SOLOPMT_RETURN_STAMP',
  'SOLOPMT_RETURN_REF',
  'SOLOPMT_RETURN_PAID'
];

exports.mapParams = function (providerConfig, options) {
  validateParams(providerConfig, options);

  return {
    SOLOPMT_VERSION: formatVersion(providerConfig.paymentVersion),
    SOLOPMT_STAMP: options.requestId,
    SOLOPMT_RCV_ID: providerConfig.vendorId,
    SOLOPMT_LANGUAGE: formatting.formatLanguage(options.language, formatting.languageFormats.allowEnglish),
    SOLOPMT_AMOUNT: formatting.formatAmount(options.amount),
    SOLOPMT_REF: options.reference,
    SOLOPMT_DATE: formatting.formatDueDate(options.dueDate, providerConfig.dueDate),
    SOLOPMT_MSG: formatting.formatMessage(options.message),
    SOLOPMT_RETURN: providerConfig.returnUrls.ok.url,
    SOLOPMT_CANCEL: providerConfig.returnUrls.cancel,
    SOLOPMT_REJECT: providerConfig.returnUrls.reject,
    SOLOPMT_CONFIRM: formatting.formatBoolean(providerConfig.confirm),
    SOLOPMT_KEYVERS: formatVersion(providerConfig.keyVersion),
    SOLOPMT_CUR: providerConfig.currency,
    SOLOPMT_PMTTYPE: options.mobile ? 'M' : undefined,
    SOLOPMT_RCV_ACCOUNT: providerConfig.vendorAccount,
    SOLOPMT_RCV_NAME: providerConfig.vendorName
  };
};

function validateParams (providerConfig, options) {
  parameters.requireParams(options, ['requestId', 'amount']);
  parameters.requireParams(providerConfig,
    ['paymentVersion', 'vendorId', 'dueDate', 'keyVersion', 'currency', 'returnUrls']);

  parameters.requireLengthMax(options, 'requestId', 20);
  parameters.requireLengthMax(options, 'message', 420);
  parameters.requireLengthMax(providerConfig, 'currency', 3);
  parameters.requireLengthMax(providerConfig, 'vendorName', 30);
  parameters.requireLengthBetween(providerConfig, 'reference', 2, 25);
  parameters.requireLengthBetween(providerConfig, 'vendorAccount', 8, 42);
  parameters.requireUrlLengthMax(providerConfig.returnUrls, 120);
}

function formatVersion(versionNumber) {
  return formatting.formatVersionNumber(versionNumber, 4);
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

exports.macFormName = 'SOLOPMT_MAC';

exports.isMyQuery = function (query) {
  return _.keys(query)[0].match(/^SOLOPMT/);
};

exports.renameQueryParams = function (query) {
  return {
    version: parseInt(query.SOLOPMT_RETURN_VERSION),
    requestId: query.SOLOPMT_RETURN_STAMP,
    reference: query.SOLOPMT_RETURN_REF,
    archivedId: query.SOLOPMT_RETURN_PAID,
    mac: query.SOLOPMT_RETURN_MAC
  };
};