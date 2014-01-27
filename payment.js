var crypto = require("crypto"),
    events = require('events'),
    _ = require('underscore')._,
    express = require('express');

var config = require('./config.json');

var basePath = "/tupas",
    cancelPath = basePath + "/cancel",
    okPath = basePath + "/ok",
    rejectPath = basePath + "/reject";

exports.create = function (globalOptions, bankOptions) {
  requireArgument(globalOptions.appHandler, "globalOptions.appHandler");
  requireArgument(globalOptions.hostUrl, "globalOptions.hostUrl");

  var paymentGen = Object.create(events.EventEmitter.prototype);
  var hostOptions = globalOptions;
  var banks = mergeWithDefaults(bankOptions);
  var bankIds = _.pluck(banks, 'id');
  var providers = createProviders(bankIds);

  paymentGen.paymentButton = function (bankId, options) {
    var bankConfig = findBank(bankId, config.banks);
    var provider = providers[bankId];

    if (provider && bankConfig) {
      return provider.createButton(bankConfig, options);
    } else {
      throw "No provider or configuration found for id '" + bankId + "'.";
    }
  };

  paymentGen.banks = bankIds;

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

function requireArgument(argValue, argName) {
  if (typeof argValue === "undefined" || argValue === null) {
    throw "Missing required argument " + argName + ".";
  }
}

function bindReturnUrlsToHandler (eventEmitter, handler) {
  handler.post(okPath, ok);
  handler.get(okPath, ok);
  handler.get(cancelPath, function (req, res) {
    eventEmitter.emit('cancel', req, res);
  });
  handler.get(rejectPath, function (req, res) {
    eventEmitter.emit('reject', req, res);
  });

  function checkMac (req) { return true; }
  function ok (req, res) {
    if (checkMac) {
      eventEmitter.emit('success', req, res);
    } else {
      eventEmitter.emit('mac-check-failed', req, res);
    }
  }
}

function returnUrls (hostUrl) {
  return {
    ok: hostUrl + okPath,
    cancel: hostUrl + cancelPath,
    reject: hostUrl + rejectPath
  };
}

function mergeWithDefaults (bankOpts) {
  return _.map(config.banks, function (bank) {
    var vendorOpts = _.find(bankOpts, function (bankConf) {
      return bankConf.id == bank.id;
    });

    if (vendorOpts) {
      return _.extend({}, bank, vendorOpts);
    } else {
      return bank;
    }
  });
}