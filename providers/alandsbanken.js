var shared = require('./aab-shared');
var parameters = require('../parameters');
var formatting = require('../format');

module.exports = shared;

exports.mapParams = function (options) {
  var params = shared.mapParams(options);

  parameters.requireParams(options, ['cookie']);
  params.BC_UseBVCookie = formatCookie(options.cookie);

  return params;
};

function formatCookie (value) {
  return formatting.formatBoolean(value).toLowerCase();
}