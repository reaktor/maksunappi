var crypto = require("crypto"),
    events = require('events'),
    _ = require('underscore')._,
    express = require('express');

var config = require('./config.json');
var parameters = require('./parameters');

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
  parameters.requireParams(globalOptions, ['appHandler', 'hostUrl']);

  globalOptions.appHandler.use(express.static(__dirname + '/public'));

  var paymentGen = Object.create(events.EventEmitter.prototype);
  var hostOptions = _.clone(globalOptions);
  var banksWithoutUrls = extendDefaults(bankOptions);
  var bankIds = _.pluck(banksWithoutUrls, 'id');
  var returnUrls = returnUrlConfig(hostOptions.hostUrl, bankIds);
  var banks = addReturnUrls(banksWithoutUrls, returnUrls);
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

      var mac = macForRequest(provider, providerParams.bankParams, bankConfig);
      providerParams.bankParams[provider.macFormName] = mac;
      var params = _.extend(commonParams(bankConfig), providerParams);

      return buttonTemplate(params);
    } else {
      throw new Error("No provider or configuration found for id '" + bankId + "'.");
    }
  };

  paymentGen.banks = bankIds;

  bindReturnUrlsToHandler(paymentGen, hostOptions.appHandler, returnUrls.ok, providers, banks);

  return paymentGen;
};

function macForRequest (provider, providerParams, bankConfig) {
  var paramsForMac = provider.requestMacParams(bankConfig, providerParams);

  return generateMac(paramsForMac, provider.algorithmType(bankConfig), bankConfig.macSeparator);
}

function generateMac(params, algorithmType, separator) {
  var joinedParams = params.join(separator) + separator;
  return crypto.createHash(algorithmType.toLowerCase()).update(joinedParams).digest('hex').toUpperCase();
}

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

function bindReturnUrlsToHandler (eventEmitter, handler, okUrls, providers, bankConfigs) {
  bindOkUrls(handler, okUrls, bankConfigs, function (req, res, bank) {
    var provider = providers[bank.id];
    var queryData = provider.renameQueryParams(req.query);
    if (checkMac(provider, bank, req.query, queryData.mac)) {
      eventEmitter.emit('success', req, res, queryData);
    } else {
      eventEmitter.emit('mac-check-failed', req, res, queryData);
    }
  });

  handler.get(cancelPath, function (req, res) {
    eventEmitter.emit('cancel', req, res);
  });

  handler.get(rejectPath, function (req, res) {
    eventEmitter.emit('reject', req, res);
  });
}

function bindOkUrls (handler, okUrls, bankConfigs, okCallback) {
  _.each(_.pairs(okUrls), function (urlConfig) {
    var callback = function (req, res) {
      okCallback(req, res, _.find(bankConfigs, function (bank) {
        return bank.id == urlConfig[0];
      }));
    };

    var okPath = urlConfig[1].path;
    handler.post(okPath, callback);
    handler.get(okPath, callback);
  });
}

function checkMac (provider, bank, query, expected) {
  var macParams = provider.returnMacParams(bank, query);
  var mac = generateMac(macParams, provider.algorithmType(bank), bank.macSeparator);
  return mac === expected;
}

function returnUrlConfig (hostUrl, bankIds) {
  var okUrls = {};
  _.each(bankIds, function (bankId) {
    var bankPath = okPath + '/' + bankId;
    okUrls[bankId] = {
      url: hostUrl + bankPath,
      path: bankPath
    };
  });

  return {
    ok: okUrls,
    cancel: hostUrl + cancelPath,
    reject: hostUrl + rejectPath
  };
}

function extendDefaults (bankOpts) {
  return _.map(config.banks, function (bank) {
    var bankWithDefaults = _.extend({}, config.defaultBank, bank);
    var vendorOpts = _.find(bankOpts, function (bankConf) {
      return bankConf.id == bankWithDefaults.id;
    });

    if (vendorOpts) {
      return _.extend({}, bankWithDefaults, vendorOpts);
    } else {
      return bankWithDefaults;
    }
  });
}

function addReturnUrls (bankConfigs, returnUrls) {
  return _.map(bankConfigs, function (bank) {
    return _.extend({}, bank, {
      returnUrls: {
        reject: returnUrls.reject,
        cancel: returnUrls.cancel,
        ok: returnUrls.ok[bank.id]
      }
    });
  });
}