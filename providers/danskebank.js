var formatting = require('../format');
var parameters = require('../parameters');

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
    OKURL: providerConfig.returnUrls.ok,
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

exports.macFormName = 'TARKISTE';