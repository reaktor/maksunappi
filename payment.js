var crypto = require("crypto")
  , events = require('events')
  , _ = require('underscore')._
  , express = require('express');

var bankConfigs = [{ 'id' : 'nordea'}, {'id' : 'danskebank'}]; // placeholder, replace with config file

exports.create = function (config) {
  var paymentGen = Object.create(events.EventEmitter.prototype);
  var banks = _.pluck(bankConfigs, 'id');
  var providers = createProviders(banks);

  paymentGen.paymentButton = function (bankId, options) {
    var bankConfig = findBank(bankId, bankConfigs);
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
    return providers[bankId] = require('./providers/'+bankId);
  });

  return providers;
}

function findBank (bankId, bankConfigs) {
  return _.find(bankConfigs, function (bank) {
    return bank.id == bankId;
  });
}