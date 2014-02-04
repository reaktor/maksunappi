var formatting = require('../format');
var parameters = require('../parameters');
var helpers = require('../helpers');
var _ = require('underscore')._;

var SHA256 = '03';
var MAC_PARAMS = [
  'SUMMA',
  'VIITE',
  'KNRO',
  'VERSIO',
  'VALUUTTA',
  'OKURL',
  'VIRHEURL',
  'ERAPAIVA'
];

var RETURN_MAC_PARAMS = [
  'VIITE',
  'SUMMA',
  'STATUS',
  'KNRO',
  'VERSIO',
  'VALUUTTA',
  'ERAPAIVA'
];

exports.mapParams = function (options) {
  parameters.requireParams(options, ['amount', 'reference', 'vendorId',
    'currency', 'paymentVersion', 'returnUrls', 'dueDate', 'algorithmType']);

  return {
    KNRO: options.vendorId,
    SUMMA: formatting.formatAmount(options.amount),
    VIITE: options.reference,
    VALUUTTA: options.currency,
    VERSIO: formatting.formatVersionNumber(options.paymentVersion, 1),
    ERAPAIVA: dueDate(options.dueDate),
    OKURL: options.returnUrls.ok.url,
    VIRHEURL: options.returnUrls.reject,
    lng: formatting.formatLanguage(options.langCode, formatting.languageFormats.allowEnglish),
    ALG: SHA256
  };
};

function dueDate(dateParam) {
  if (dateParam == 'EXPRESS' || dateParam == 'HETI') {
    return formatting.dueDateToday();
  } else {
    return formatting.formatDueDate(dateParam);
  }
}

exports.algorithmType = function (bankConfig) {
  return bankConfig.algorithmType;
};

exports.requestMacParams = function (providerConfig, formParams) {
  return parameters.macParams(formParams, MAC_PARAMS, [providerConfig.checksumKey]);
};

exports.returnMacParams = function (providerConfig, queryParams) {
  return parameters.macParams(queryParams, RETURN_MAC_PARAMS, [providerConfig.checksumKey]);
};

exports.macFormName = 'TARKISTE';

exports.renameQueryParams = function (query) {
  return {
    version: helpers.toIntOrUndefined(query.VERSIO),
    reference: query.VIITE,
    mac: query.TARKISTE,
    currency: query.VALUUTTA,
    vendorId: query.KNRO,
    dueDate: query.ERAPAIVA,
    paymentStatus: query.STATUS,
    paymentSum: query.SUMMA,
    paymentMethod: query.MTAPA
  };
};