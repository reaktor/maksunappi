var crypto = require("crypto"),
    events = require('events'),
    _ = require('underscore')._,
    express = require('express'),
    converter = require('./referenceConverter');

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
  initLogger(globalOptions);
  parameters.requireParams(globalOptions, ['appHandler', 'hostUrl']);

  var paymentGen = Object.create(events.EventEmitter.prototype);
  var hostOptions = _.clone(globalOptions);
  var banks = setupBanks(bankOptions, globalOptions.hostUrl);

  paymentGen.buildRequestParams = function (bankId, options) {
    var bank = findBank(bankId, banks);
    return requestParams(bank, options);
  };

  paymentGen.paymentButton = function (bankId, options) {
    var bank = findBank(bankId, banks);
    return createButton(bank, options);
  };

  paymentGen.referenceNumbers = converter;
  paymentGen.banks = _.pluck(banks, 'id');

  bindReturnUrlsToHandler(paymentGen, hostOptions.appHandler, banks);
  hostOptions.appHandler.use(express.static(__dirname + '/public'));

  return paymentGen;
};

exports.referenceNumbers = converter;

function initLogger(globalOptions) {
  var logger = require('./logger');
  if(globalOptions.logger){
    logger.setLogger(globalOptions.logger);
  }
}

function requestParams (bank, options) {
  var provider = bank.provider;
  if (provider && bank) {
    var formParams = provider.mapParams(_.extend({}, bank, options));
    var nonEmptyParams = removeIf(formParams, function (k, v) {
      return !v;
    });

    nonEmptyParams[provider.macFormName] =
      macForRequest(provider, nonEmptyParams, bank);

    return nonEmptyParams;
  } else {
    throw new Error("No provider or configuration found for id '" + bank.id + "'.");
  }
}

function createButton (bank, options) {
  var bankParams = requestParams(bank, options);
  var params = _.extend(commonParams(bank), {
    bankParams: bankParams
  });

  return buttonTemplate(params);
}

function setupBanks(bankOptions, hostUrl) {
  var banksWithoutUrls = extendDefaults(bankOptions);
  var bankIds = _.pluck(banksWithoutUrls, 'id');
  var returnUrls = returnUrlConfig(hostUrl, bankIds);
  return addProviders(addReturnUrls(banksWithoutUrls, returnUrls));
}

function addProviders (banks) {
  return _.map(banks, function (bank) {
    return _.extend({}, bank, { provider: require('./providers/'+bank.id) });
  });
}

function macForRequest (provider, providerParams, bankConfig) {
  var paramsForMac = provider.requestMacParams(bankConfig, providerParams);

  return generateMac(paramsForMac, provider.algorithmType(bankConfig), bankConfig.macSeparator);
}

function generateMac(params, algorithmType, separator) {
  var joinedParams = params.join(separator) + separator;
  return crypto.createHash(algorithmType.toLowerCase()).update(joinedParams, 'binary').digest('hex').toUpperCase();
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

function findBank (bankId, bankConfigs) {
  return _.find(bankConfigs, function (bank) {
    return bank.id == bankId;
  });
}

function bindReturnUrlsToHandler (eventEmitter, handler, banks) {
  bindOkUrls(handler, banks, function (req, res, bank) {
    var provider = bank.provider;
    var queryData = provider.renameQueryParams(req.query);

    if (_.isEmpty(req.query) || checkMac(bank, req.query, queryData.mac)) {
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

function bindOkUrls (handler, banks, okCallback) {
  _.each(banks, function (bank) {
    var callback = function (req, res) {
      okCallback(req, res, bank);
    };

    var okPath = bank.returnUrls.ok.path;
    handler.post(okPath, callback);
    handler.get(okPath, callback);
  });
}

function checkMac (bank, query, expected) {
  var macParams = _.filter(bank.provider.returnMacParams(bank, query), function(param){
    return typeof param !== "undefined";
  });
  var mac = generateMac(macParams, bank.provider.algorithmType(bank), bank.macSeparator);
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
