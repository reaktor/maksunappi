var shared = require('./aab-shared');
var parameters = require('../parameters');

module.exports = shared;

exports.mapParams = function (providerConfig, options) {
  var params = shared.mapParams(providerConfig, options);

  parameters.requireParams(providerConfig, ['cookie']);
  params.BC_UseBVCookie = providerConfig.cookie;

  return params;
};