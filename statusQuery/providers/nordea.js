var formatting = require('../../format'),
    parameters = require('../../parameters'),
    helpers = require('../../helpers');

var MAC_PARAMS = [
  'SOLOPMT_VERSION',
  'SOLOPMT_TIMESTMP',
  'SOLOPMT_RCV_ID',
  'SOLOPMT_LANGUAGE',
  'SOLOPMT_RESPTYPE',
  'SOLOPMT_RESPDATA',
  'SOLOPMT_RESPDETL',
  'SOLOPMT_STAMP',
  'SOLOPMT_REF',
  'SOLOPMT_AMOUNT',
  'SOLOPMT_CUR',
  'SOLOPMT_KEYVERS',
  'SOLOPMT_ALG'
];

var RETURN_MAC_PARAMS = [
  'SOLOPMT_VERSION',
  'SOLOPMT_TIMESTMP',
  'SOLOPMT_RCV_ID',
  'SOLOPMT_RESPCODE',
  'SOLOPMT_STAMP',
  'SOLOPMT_RCV_ACCOUNT',
  'SOLOPMT_REF',
  'SOLOPMT_DATE',
  'SOLOPMT_AMOUNT',
  'SOLOPMT_CUR',
  'SOLOPMT_PAID',
  'SOLOPMT_STATUS',
  'SOLOPMT_KEYVERS',
  'SOLOPMT_ALG'
];

exports.mapParams = function (options) {
  parameters.requireParams(options, ['requestId', 'statusQueryVersion',
    'vendorId', 'keyVersion', 'algorithmType']);
  parameters.requireInclusionIn(options, 'responseType', ['html', 'xml']);

  return {
    SOLOPMT_VERSION: formatVersion(options.statusQueryVersion),
    SOLOPMT_TIMESTMP: options.timeStamp,
    SOLOPMT_RCV_ID: options.vendorId,
    SOLOPMT_LANGUAGE: formatting.formatLanguage(options.language, formatting.languageFormats.allowEnglish),
    SOLOPMT_RESPTYPE: options.responseType,
    SOLOPMT_RESPDATA: options.responseExtraData, // TODO: rename option
    SOLOPMT_RESPDETL: formatting.formatBoolean(options.includeResponseDetails, formatting.booleanFormats.YOrNothing),
    SOLOPMT_STAMP: options.requestId,
    SOLOPMT_REF: options.reference,
    SOLOPMT_AMOUNT: formatting.formatAmount(options.amount),
    SOLOPMT_CUR: options.currency,
    SOLOPMT_KEYVERS: formatVersion(options.keyVersion),
    SOLOPMT_ALG: formatting.formatVersionNumber(formatAlgorithm(options.algorithmType), 2)
  };
};

function formatVersion(versionNumber) {
  return formatting.formatVersionNumber(versionNumber, 4);
}

function formatAlgorithm (algorithmType) {
  if (algorithmType == 'md5') {
    return 1;
  } else {
    throw new Error("Unsupported MAC algorithm for Nordea status queries: " + algorithmType);
  }
}

exports.algorithmType = function (bankConfig) {
  return bankConfig.algorithmType;
};

exports.requestMacParams = function (providerConfig, formParams) {
  var macParams = parameters.macParams(formParams, MAC_PARAMS, [], [providerConfig.checksumKey]);
  return helpers.removeIfEmpty(macParams);
};

exports.returnMacParams = function (providerConfig, queryParams) {
  return parameters.macParams(queryParams, RETURN_MAC_PARAMS, [], [providerConfig.checksumKey]);
};

exports.macFormName = 'SOLOPMT_MAC';

exports.renameQueryParams = function (query) {
  return {
    version: helpers.toIntOrUndefined(query.SOLOPMT_VERSION),
    timeStamp: query.SOLOPMT_TIMESTMP,
    vendorId: query.SOLOPMT_RCV_ID,
    paymentStatus: convertResponseCode(query.SOLOPMT_RESPCODE),
    requestId: query.SOLOPMT_STAMP,
    vendorAccount: query.SOLOPMT_RCV_ACCOUNT,
    reference: query.SOLOPMT_REF,
    datePaid: helpers.parseDate(query.SOLOPMT_DATE),
    amount: parseInt(query.SOLOPMT_AMOUNT) / 100,
    currency: query.SOLOPMT_CUR,
    archivedId: query.SOLOPMT_PAID,
    paymentType: query.SOLOPMT_STATUS,
    macKeyVersion: helpers.toIntOrUndefined(query.SOLOPMT_KEYVERS),
    macAlgorithm: formatReturnAlgorithm(helpers.toIntOrUndefined(query.SOLOPMT_ALG)),
    mac: query.SOLOPMT_MAC
  };
};

function convertResponseCode(responseCode) {
  switch (responseCode.toUpperCase()) {
    case "OK": return "OK";
    case "NOTFOUND": return "NOT FOUND";
    case "ERROR": return "ERROR";
    default: throw new Error("Received unknown response code from bank: " + responseCode);
  }
}

function formatReturnAlgorithm (algorithmCode) {
  if (algorithmCode === undefined) {
    return undefined;
  } else if (algorithmCode === 1) {
    return 'md5';
  } else {
    throw new Error("Received unknown MAC algorithm code from bank: " + algorithmCode);
  }
}