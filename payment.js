var crypto = require("crypto")
  , events = require('events')
  , _ = require('underscore')._
  , express = require('express');

var config = require('./config.json');

exports.create = function (globalOptions) {
  var paymentGen = Object.create(events.EventEmitter.prototype);
  var hostOptions = globalOptions;
  var banks = _.pluck(config.banks, 'id');
  var providers = createProviders(banks);

  paymentGen.paymentButton = function (bankId, options) {
    var bankConfig = findBank(bankId, config.banks);
    var provider = providers[bankId];

    if (provider && bankConfig) {
      return provider.createButton(bankConfig, options);
    } else {
      throw "No provider or configuration found for id '" + bankId + "'.";
    }
  };

  paymentGen.banks = banks;

  return paymentGen;
};

function createProviders (banks) {
  var providers = {};
  _.each(banks, function (bankId) {
    providers[bankId] = require('./providers/'+bankId);
  });

  return providers;
}

function findBank (bankId, bankConfigs) {
  return _.find(bankConfigs, function (bank) {
    return bank.id == bankId;
  });
}