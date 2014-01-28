// Provider stub
var _ = require('underscore')._;
_.str = require('underscore.string');

exports.mapParams = function (providerConfig, options) {
  // TODO: parameter validation

  return {
    SOLOPMT_VERSION: providerConfig.paymentVersion,
    SOLOPMT_STAMP: options.requestId,
    SOLOPMT_RCV_ID: providerConfig.vendorId,
    SOLOPMT_LANGUAGE: mapLanguage(options.language),
    SOLOPMT_AMOUNT: formatAmount(options.amount),
    SOLOPMT_REF: options.paymentReference,
    SOLOPMT_DATE: 'EXPRESS', // TODO: specify date in options, define default in config
    SOLOPMT_MSG: options.message, // TODO: formatting
    SOLOPMT_RETURN: providerConfig.returnUrls.ok,
    SOLOPMT_CANCEL: providerConfig.returnUrls.cancel,
    SOLOPMT_REJECT: providerConfig.returnUrls.reject,
    SOLOPMT_CONFIRM: confirmation(options.confirm, providerConfig.confirm),
    SOLOPMT_KEYVERS: providerConfig.keyVersion,
    SOLOPMT_CUR: providerConfig.currency,
    SOLOPMT_PMTTYPE: options.mobile ? 'M' : undefined,
    SOLOPMT_RCV_ACCOUNT: providerConfig.vendorAccount,
    SOLOPMT_RCV_NAME: providerConfig.vendorName
    // TODO: MAC
  };
};

function confirmation(confirm, defaultValue) {
  if (_.isNull(confirm) || _.isUndefined(confirm)) {
    return defaultValue;
  } else {
    return toParam(confirm);
  }

  function toParam(confirm) {
    if (confirm) {
      return "YES";
    } else {
      return "NO";
    }
  }
}

function formatAmount(amount) {
  return _.str.numberFormat(amount, 2, ',', '')
}

function mapLanguage(langCode) {
  switch (langCode.toUpperCase()) {
    case "FI": return 1;
    case "SV": return 2;
    case "EN": return 3;
    default: throw "Unsupported language code '" + langCode + "'.";
  }
}