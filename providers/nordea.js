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

exports.mapParams = function (options) {
  parameters.requireParams(options, ['requestId', 'amount',
    'paymentVersion', 'vendorId', 'dueDate', 'keyVersion', 'currency', 'returnUrls']);

  return {
    SOLOPMT_VERSION: formatVersion(options.paymentVersion),
    SOLOPMT_STAMP: options.requestId,
    SOLOPMT_RCV_ID: options.vendorId,
    SOLOPMT_LANGUAGE: formatting.formatLanguage(options.language, formatting.languageFormats.allowEnglish),
    SOLOPMT_AMOUNT: formatting.formatAmount(options.amount),
    SOLOPMT_REF: options.reference,
    SOLOPMT_DATE: formatting.formatDueDate(options.dueDate),
    SOLOPMT_MSG: formatting.formatMessage(options.messageForBankStatement),
    SOLOPMT_RETURN: options.returnUrls.ok.url,
    SOLOPMT_CANCEL: options.returnUrls.cancel,
    SOLOPMT_REJECT: options.returnUrls.reject,
    SOLOPMT_CONFIRM: formatting.formatBoolean(options.confirm),
    SOLOPMT_KEYVERS: formatVersion(options.keyVersion),
    SOLOPMT_CUR: options.currency,
    SOLOPMT_PMTTYPE: options.mobile ? 'M' : undefined,
    SOLOPMT_RCV_ACCOUNT: options.vendorAccount,
    SOLOPMT_RCV_NAME: options.vendorName
  };
};

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

exports.renameQueryParams = function (query) {
  return {
    version: helpers.toIntOrUndefined(query.SOLOPMT_RETURN_VERSION),
    requestId: query.SOLOPMT_RETURN_STAMP,
    reference: query.SOLOPMT_RETURN_REF,
    archivedId: query.SOLOPMT_RETURN_PAID,
    mac: query.SOLOPMT_RETURN_MAC
  };
};