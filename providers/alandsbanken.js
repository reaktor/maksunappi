var formatting = require('../format');

exports.mapParams = function (providerConfig, options) {
  return {
    "AAB_VERSION" : providerConfig.paymentVersion,
    "AAB_STAMP" : options.requestId,
    "AAB_RCV_ID" : providerConfig.vendorId,
    "AAB_RCV_ACCOUNT" : options.amount,
    "AAB_RCV_NAME" : providerConfig.vendorName,
    "AAB_LANGUAGE" : formatting.formatLanguage(options.language, formatting.mapEnglishToDefault),
    "AAB_AMOUNT" : formatting.formatAmount(options.amount),
    "AAB_REF" : options.paymentReference,
    "AAB_DATE" : formatting.formatDueDate(options.dueDate, providerConfig.dueDate),
    "AAB_MSG" : formatting.formatMessage(options.message),
    "AAB_RETURN" : providerConfig.returnUrls.ok,
    "AAB_CANCEL" : providerConfig.returnUrls.cancel,
    "AAB_REJECT" : providerConfig.returnUrls.reject,
    "AAB_MAC" : options.checksum,
    "AAB_CONFIRM" : providerConfig.confirm,
    "AAB_KEYVERS" : providerConfig.keyVersion,
    "AAB_CUR" : providerConfig.currency,
    "BC_UseBVCookie" : providerConfig.cookie
  };
};