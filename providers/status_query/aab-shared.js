var parameters = require('../../parameters');
var formatting = require('../../formatting');



exports.mapParams = function (options) {
  validateParams(options);

  return {
    "CBS_VERSION" : formatVersion(options.paymentVersion),
    "CBS_TIMESTAMP" : options.requestId,
    "CBS_RCV_ID" : options.vendorId,
    "CBS_LANGUAGE" : formatting.formatLanguage(options.language, formatting.languageFormats.mapEnglishToDefault),
    "CBS_RESPTYPE" : options.responseType,
    "CBS_RESPDATA" : options.responseExtraData,
    "CBS_STAMP"    : options.paymentId,
    "CBS_REF"      : options.paymentReference,
    "CBS_AMOUNT"   : options.amount,
    "CBS_CUR"      : options.currency,
    "CBS_KEYVERS"  : options.keyVersion,
    "CBS_ALG"      : options.algorithmType
  };
};

exports.macFormName = 'CBS_MAC';

function validateParams (options) {
  parameters.requireParams(options, ['version']);

  parameters.requireInclusionIn(options, 'dueDate', ['EXPRESS']);
  parameters.requireLengthMax(options, 'requestId', 15);
}

function formatVersion(versionNumber) {
  return formatting.formatVersionNumber(versionNumber, 4);
}