var _ = require('underscore')._;

exports.isNullOrUndefined = function (value) {
  return _.isNull(value) || _.isUndefined(value);
};

exports.lessThanIgnoreTime = function (date1, date2) {
  function withoutTime (date) {
    return new Date(date.getTime()).setHours(0, 0, 0, 0);
  }

  return withoutTime(date1) < withoutTime(date2);
};

exports.times = function (times, execute) {
  _.each(_.range(times), execute);
};

exports.getElemenByIdxOrDefault = function(array, idx, def) {
  return array && array.length - 1 >= idx ?  array[idx] : def;
};

exports.sum = function (collection) {
  return _.reduce(collection, function (acc, n) { return acc + n; }, 0);
};

exports.flatMap = function (collection, fun) {
  return _.flatten(_.map(collection, fun));
};

exports.toIntOrUndefined = function (value) {
  return isNaN(value) ? undefined : parseInt(value);
};