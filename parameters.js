var _ = require('underscore')._;
var helpers = require('./helpers');

// TODO: option to log errors
exports.requireParams = function (params, required) {
  _.each(required, function (key) {
    if (helpers.isNullOrUndefined(params[key]) || params[key] === "") {
      throw new Error("Missing required argument '" + key + "'.");
    }
  });
};

exports.requireInclusionIn = function (params, paramName, allowed) {
  if (!_.contains(allowed, params[paramName])) {
    throw new Error("Unsupported value for '" + paramName +
      "': '" + params[paramName] + "'." )
  }
};