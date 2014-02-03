var formatting = require('../format');
var parameters = require('../parameters');
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

exports.mapParams = function (providerConfig, options) {
  parameters.requireParams(options, ['amount', 'requestId']);
  parameters.requireParams(providerConfig,
    ['vendorId', 'currency', 'paymentVersion', 'returnUrls']);

  return {
    KNRO: providerConfig.vendorId,
    SUMMA: formatting.formatAmount(options.amount),
    VIITE: formatting.formatToPaymentReference(options.requestId),
    VALUUTTA: providerConfig.currency,
    VERSIO: providerConfig.paymentVersion,
    ERAPAIVA: dueDate(options.dueDate),
    OKURL: providerConfig.returnUrls.ok.url,
    VIRHEURL: providerConfig.returnUrls.reject,
    lng: formatting.formatLanguage(options.langCode, formatting.allowEnglish),
    ALG: SHA256
  };
};

function dueDate(dateParam) {
  if (dateParam == 'EXPRESS' || dateParam == 'HETI') {
    return formatting.dueDateToday();
  } else {
    return formatting.formatDueDate(dateParam, formatting.dueDateToday());
  }
}

exports.algorithmType = function (bankConfig) {
  return bankConfig.algorithmType;
};

exports.requestMacParams = function (providerConfig, formParams) {
  return parameters.macParams(formParams, MAC_PARAMS, [providerConfig.checksumKey]);
};

exports.returnMacParams = function (providerConfig, queryParams) {
  return parameters.macParams(queryParams, [], [providerConfig.checksumKey]);
};

exports.macFormName = 'TARKISTE';

exports.isMyQuery = function (query) {
  var keys = _.keys(query);
  return _.contains(keys, 'KNRO') &&
    _.contains(keys, 'VALUUTTA') &&
    _.contains(keys, 'STATUS');
};

exports.renameQueryParams = function (query) {
  return {
    version: parseInt(query.VERSIO),
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