var shared = require('./aab-shared');
var parameters = require('../parameters');

var algorithmKey = {
  "md5": "01",
  "sha256": "03",
};

var sharedMapParams = shared.mapParams;

module.exports = shared;

module.exports.mapParams = function (options) {
  parameters.requireParams(options, ['algorithmType']);
  
  var params = sharedMapParams(options);
  params.AAB_ALG = algorithmKey[options.algorithmType];
  return params;
};
