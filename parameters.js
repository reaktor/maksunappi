var _ = require('underscore')._;
var helpers = require('./helpers');

// TODO: option to log errors
exports.requireParams = function (params, required) {
  _.each(required, function (key) {
    if (helpers.isEmpty(params[key])) {
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

exports.requireLengthBetween = function (params, paramName, min, max, paramNameForMessage) {
  exports.requireLengthMin(params, paramName, min, paramNameForMessage);
  exports.requireLengthMax(params, paramName, max, paramNameForMessage);
};

exports.requireLengthMin = function (params, paramName, minLength, paramNameForMessage) {
  if (params[paramName] && params[paramName].toString().length < minLength) {
    throw new Error((paramNameForMessage || paramName) +" is too short: '" + params[paramName] + "' (minimum length "+minLength+").");
  }
};

exports.requireLengthMax = function (params, paramName, maxLength, paramNameForMessage) {
  if (params[paramName] && params[paramName].toString().length > maxLength) {
    throw new Error((paramNameForMessage || paramName) +" is too long: '" + params[paramName] + "' (maximum length "+maxLength+").");
  }
};

exports.requireSatisfies = function (params, paramName, condition, message) {
  if (!condition(params[paramName])) {
    throw new Error(message ? message : "Invalid value for '" + paramName + "': '" + params[paramName] +"'.");
  }
};

exports.requireUrlLengthMax = function (urls, maxLength) {
  exports.requireLengthMax(urls.ok, 'url', maxLength, 'Return url');
  exports.requireLengthMax(urls, 'cancel', maxLength, 'Cancel url');
  exports.requireLengthMax(urls, 'reject', maxLength, 'Reject url');
};