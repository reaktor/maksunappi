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