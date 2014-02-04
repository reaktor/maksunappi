var shared = require('./aab-shared');
var parameters = require('../parameters');
var formatting = require('../format');

module.exports = shared;

exports.mapParams = function (providerConfig, options) {
  var params = shared.mapParams(providerConfig, options);

  parameters.requireParams(providerConfig, ['cookie']);
  params.BC_UseBVCookie = formatCookie(providerConfig.cookie);

  return params;
};

function formatCookie (value) {
  return formatting.formatBoolean(value).toLowerCase();
}

exports.isMyQuery = function (query) {
  return false;
};