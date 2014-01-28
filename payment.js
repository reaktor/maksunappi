var crypto = require("crypto"),
    events = require('events'),
    _ = require('underscore')._,
    express = require('express');

var config = require('./config.json');

var basePath = "/epayments",
    cancelPath = basePath + "/cancel",
    okPath = basePath + "/ok",
    rejectPath = basePath + "/reject";

var buttonTemplate = _.template(
  '<form id="<%= id %>-payment-form" method="POST" action="<%= paymentUrl %>" class="payment-button">'+
  '<div id="<%= id %>-payment" style="cursor: pointer">' +
  '  <div class="bank-payment-image"><img src="<%= imgPath %>" alt="<%= name %>"></div>' +
  '  <div class="bank-payment-name"><a href="#"><%= name %></a></div>' +
  '</div>' +
  '<% _.each(_.pairs(bankParams), function (pair) { %><input name="<%= pair[0] %>" value="<%= pair[1] %>" type="hidden"><% }) %>'+
  '</form>' +
  '<script>' +
  'var bankPayment = document.getElementById("<%= id %>-payment");' +
  'var clickHandler = function() {' +
  'document.getElementById("<%= id %>-payment-form").submit();' +
  '};' +
  'if(bankPayment.addEventListener) {' +
  'bankPayment.addEventListener("click", clickHandler, false);' +
  '}'+
  'else if (bankPayment.attachEvent) {' +
  'bankPayment.attachEvent("onclick", clickHandler);' +
  '}' +
  '</script>' +
  '</form>'
);

exports.create = function (globalOptions, bankOptions) {
  requireArgument(globalOptions.appHandler, "globalOptions.appHandler");
  requireArgument(globalOptions.hostUrl, "globalOptions.hostUrl");

  globalOptions.appHandler.use(express.static(__dirname + '/public'));

  var paymentGen = Object.create(events.EventEmitter.prototype);
  var hostOptions = _.clone(globalOptions);
  var returnUrls = returnUrlConfig(hostOptions.hostUrl);
  var banks = extendAllWith(extendDefaults(bankOptions), returnUrls);
  var bankIds = _.pluck(banks, 'id');
  var providers = createProviders(bankIds);

  paymentGen.paymentButton = function (bankId, options) {
    var bankConfig = findBank(bankId, banks);
    var provider = providers[bankId];

    if (provider && bankConfig) {
      var providerParams = {
        bankParams: removeIf(provider.mapParams(bankConfig, options), function (k, v) {
          return !v;
        })
      };
      var params = _.extend(commonParams(bankConfig), providerParams);
      return buttonTemplate(params);
    } else {
      throw "No provider or configuration found for id '" + bankId + "'.";
    }
  };

  paymentGen.banks = bankIds;

  bindReturnUrlsToHandler(paymentGen, hostOptions.appHandler);

  return paymentGen;
};

function removeIf (params, condition) {
  var cloned = _.clone(params);
  _.each(_.keys(cloned), function (key) {
    if (condition(key, cloned[key])) {
      delete cloned[key];
    }
  });

  return cloned;
}

function commonParams(bank) {
  return {
    id : bank.id,
    name : bank.name,
    paymentUrl : bank.paymentUrl,
    imgPath: bank.imgPath
  };
}

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

function returnUrlConfig (hostUrl) {
  return { returnUrls: {
    ok: hostUrl + okPath,
    cancel: hostUrl + cancelPath,
    reject: hostUrl + rejectPath
  }};
}

function extendDefaults (bankOpts) {
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

function extendAllWith (bankConfigs, extension) {
  return _.map(bankConfigs, function (bank) {
    return _.extend({}, bank, extension);
  })
}