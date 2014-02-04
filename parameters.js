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

exports.pick = function (params, keys) {
  return _.map(keys, function (key) {
    return params[key];
  });
};

exports.macParams = function (formParams, keys, addToStart, addToEnd) {
  var params = exports.pick(formParams, keys);
  addToStart = addToStart || [];
  addToEnd = addToEnd || [];

  return addToStart.concat(params).concat(addToEnd);
};

exports.requireLengthMax = function (params, paramName, maxLength) {
  if (params[paramName].toString().length > maxLength) {
    throw new Error(paramName +" is too long: " + params[paramName] + ".");
  }
}

exports.requireSatisfies = function (params, paramName, condition, message) {
  if (!condition(params[paramName])) {
    throw new Error(message ? message : "Invalid value for '" + paramName + "': '" + params[paramName] +"'.");
  }
};