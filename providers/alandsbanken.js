exports.mapParams = function (providerConfig, options) {
  return {
    "AAB_VERSION" : providerConfig.paymentVersion,
    "AAB_STAMP" : options.requestId,
    "AAB_RCV_ID" : providerConfig.vendorId,
    "AAB_RCV_ACCOUNT" : options.amount,
    "AAB_RCV_NAME" : providerConfig.vendorName,
    "AAB_LANGUAGE" : options.language,
    "AAB_AMOUNT" : options.amount,
    "AAB_REF" : options.paymentReference,
    "AAB_DATE" : options.dueDate,
    "AAB_MSG" : options.message,
    "AAB_RETURN" : providerConfig.returnUrl,
    "AAB_CANCEL" : providerConfig.cancelUrl,
    "AAB_REJECT" : providerConfig.rejectUrl,
    "AAB_MAC" : options.checksum,
    "AAB_CONFIRM" : providerConfig.confirm,
    "AAB_KEYVERS" : providerConfig.keyVersion,
    "AAB_CUR" : providerConfig.currency,
    "BC_UseBVCookie" : providerConfig.cookie

  };
};