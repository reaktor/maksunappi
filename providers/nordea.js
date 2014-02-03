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
  parameters.requireParams(options, ['requestId', 'amount']);
  parameters.requireParams(providerConfig,
    ['paymentVersion', 'vendorId', 'dueDate', 'keyVersion', 'currency', 'returnUrls']);

  return {
    SOLOPMT_VERSION: providerConfig.paymentVersion,
    SOLOPMT_STAMP: options.requestId,
    SOLOPMT_RCV_ID: providerConfig.vendorId,
    SOLOPMT_LANGUAGE: formatting.formatLanguage(options.language, formatting.allowEnglish),
    SOLOPMT_AMOUNT: formatting.formatAmount(options.amount),
    SOLOPMT_REF: options.reference,
    SOLOPMT_DATE: formatting.formatDueDate(options.dueDate, providerConfig.dueDate),
    SOLOPMT_MSG: formatting.formatMessage(options.message),
    SOLOPMT_RETURN: providerConfig.returnUrls.ok.url,
    SOLOPMT_CANCEL: providerConfig.returnUrls.cancel,
    SOLOPMT_REJECT: providerConfig.returnUrls.reject,
    SOLOPMT_CONFIRM: formatting.formatConfirmation(options.confirm, providerConfig.confirm),
    SOLOPMT_KEYVERS: providerConfig.keyVersion,
    SOLOPMT_CUR: providerConfig.currency,
    SOLOPMT_PMTTYPE: options.mobile ? 'M' : undefined,
    SOLOPMT_RCV_ACCOUNT: providerConfig.vendorAccount,
    SOLOPMT_RCV_NAME: providerConfig.vendorName
  };
};

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