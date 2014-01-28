var formatting = require('../format');
var parameters = require('../parameters');

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
    SOLOPMT_REF: options.paymentReference,
    SOLOPMT_DATE: formatting.formatDueDate(options.dueDate, providerConfig.dueDate),
    SOLOPMT_MSG: formatting.formatMessage(options.message),
    SOLOPMT_RETURN: providerConfig.returnUrls.ok,
    SOLOPMT_CANCEL: providerConfig.returnUrls.cancel,
    SOLOPMT_REJECT: providerConfig.returnUrls.reject,
    SOLOPMT_CONFIRM: formatting.formatConfirmation(options.confirm, providerConfig.confirm),
    SOLOPMT_KEYVERS: providerConfig.keyVersion,
    SOLOPMT_CUR: providerConfig.currency,
    SOLOPMT_PMTTYPE: options.mobile ? 'M' : undefined,
    SOLOPMT_RCV_ACCOUNT: providerConfig.vendorAccount,
    SOLOPMT_RCV_NAME: providerConfig.vendorName
    // TODO: MAC
  };
};

exports.requestMacParams = function() {
  return ['SOLOPMT_VERSION',
    'SOLOPMT_STAMP',
    'SOLOPMT_RCV_ID',
    'SOLOPMT_AMOUNT',
    'SOLOPMT_REF',
    'SOLOPMT_DATE',
    'SOLOPMT_CUR'];
};

exports.macFormName = 'SOLOPMT_MAC';