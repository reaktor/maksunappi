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

exports.mapParams = function (options) {
  parameters.requireParams(options, ['requestId', 'amount', 'reference',
    'paymentVersion', 'vendorId', 'keyVersion', 'currency', 'returnUrls']
  );

  var splittedMessage = splitAndFormatMessage(options.messageForBankStatement);
  var line1 = helpers.getElemenByIdxOrDefault(splittedMessage, 0 , "");
  var line2 = helpers.getElemenByIdxOrDefault(splittedMessage, 1 , "");

  return {
    "action_id" : "701",
    "VERSIO" : formatting.formatVersionNumber(options.paymentVersion, 4),
    "MAKSUTUNNUS" : options.requestId,
    "MYYJA" : options.vendorId,
    "SUMMA" : formatting.formatAmount(options.amount),
    "VIITE" :  options.reference,
    "VIESTI" : formatting.formatMessage(options.messageForWebForm),
    "VIEST1" : line1,
    "VIEST2" : line2,
    "TARKISTE-VERSIO" : options.keyVersion,
    "PALUU-LINKKI" : options.returnUrls.ok.url,
    "PERUUTUS-LINKKI" : options.returnUrls.cancel,
    "VAHVISTUS" : formatting.formatBoolean(options.confirm, formatting.booleanFormats.KOrE),
    "VALUUTTALAJI" : options.currency,
    "ERAPVM" : formatting.formatDueDate(options.dueDate)
  };
};

function splitAndFormatMessage(rawMessage) {
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

exports.renameQueryParams = function (query) {
  return {
    version: helpers.toIntOrUndefined(query.VERSIO),
    requestId: query.MAKSUTUNNUS,
    reference: query.VIITE,
    archivedId: query.ARKISTOINTITUNNUS,
    mac: query.TARKISTE,
    macVersion: query["TARKISTE-VERSIO"]
  };
};