var formatting = require('../format');
var parameters = require('../parameters');
var helpers = require('../helpers');
var _ = require('underscore')._;

var MAC_PARAMS = [
  'VERSIO',
  'MAKSUTUNNUS',
  'MYYJA',
  'SUMMA',
  'VIITE',
  'VIEST1',
  'VIEST2',
  'VALUUTTALAJI',
  'TARKISTE-VERSIO'
];

var RETURN_MAC_PARAMS = [
  'VERSIO',
  'MAKSUTUNNUS',
  'VIITE',
  'ARKISTOINTITUNNUS',
  'TARKISTE-VERSIO'
];

exports.mapParams = function (providerConfig, options) {
  parameters.requireParams(options, ['requestId', 'amount']);
  parameters.requireParams(providerConfig,
      ['currency', 'returnUrls']
  );

  var splittedMessage = splittedAndFormattedMessage(options.message);
  var line1 = helpers.getElemenByIdxOrDefault(splittedMessage, 0 , "");
  var line2 = helpers.getElemenByIdxOrDefault(splittedMessage, 1 , "");

  return {
    "action_id" : "701",
    "VERSIO" : providerConfig.paymentVersion,
    "MAKSUTUNNUS" : options.requestId,
    "MYYJA" : providerConfig.vendorId,
    "SUMMA" : formatting.formatAmount(options.amount),
    "VIITE" :  options.reference,
    "VIESTI" : formatting.formatMessage(options.message),
    "VIEST1" : line1,
    "VIEST2" : line2,
    "TARKISTE-VERSIO" : providerConfig.keyVersion,
    "PALUU-LINKKI" : providerConfig.returnUrls.ok.url,
    "PERUUTUS-LINKKI" : providerConfig.returnUrls.cancel,
    "VAHVISTUS" : providerConfig.confirm,
    "VALUUTTALAJI" : providerConfig.currency,
    "ERAPVM" : options.dueDate
  };
};

function splittedAndFormattedMessage(rawMessage) {
  var lines = 2;
  var message = formatting.formatMessage(rawMessage, lines);
  if (!message) return undefined;
  return message.split('\r\n');
}

exports.algorithmType = function (bankConfig) {
  return bankConfig.algorithmType;
};

exports.requestMacParams = function (providerConfig, formParams) {
  return parameters.macParams(formParams, MAC_PARAMS, [], [providerConfig.checksumKey]);
};

exports.returnMacParams = function (providerConfig, queryParams) {
  return _.map(parameters.macParams(queryParams, RETURN_MAC_PARAMS, [], [providerConfig.checksumKey]),
    function (value) { return value.trim(); });
};

exports.macFormName = 'TARKISTE';

exports.isMyQuery = function (query) {
  var keys = _.keys(query);
  return _.contains(keys, 'MAKSUTUNNUS') &&
    _.contains(keys, 'ARKISTOINTITUNNUS');
};

exports.renameQueryParams = function (query) {
  return {
    version: parseInt(query.VERSIO),
    requestId: query.MAKSUTUNNUS,
    reference: query.VIITE,
    archivedId: query.ARKISTOINTITUNNUS,
    mac: query.TARKISTE,
    macVersion: query["TARKISTE-VERSIO"]
  };
};