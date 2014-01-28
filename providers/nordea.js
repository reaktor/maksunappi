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
    SOLOPMT_LANGUAGE: formatLanguage(options.language),
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

function formatLanguage(langCode) {
  if (!langCode) return 1;

  switch (langCode.toUpperCase()) {
    case "FI": return 1;
    case "SV": return 2;
    case "EN": return 3;
    default: throw "Unsupported language code '" + langCode + "'.";
  }
}