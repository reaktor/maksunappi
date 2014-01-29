var _ = require('underscore')._;

exports.isNullOrUndefined = function (value) {
  return _.isNull(value) || _.isUndefined(value);
};