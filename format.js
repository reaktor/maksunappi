var _ = require('underscore')._;
_.str = require('underscore.string');

var MAX_ROW_LEN = 35;
var MAX_ROWS = 6;
var LINEBREAK = '\r\n';

exports.formatToPaymentReference = function(number) {
  var numStr = number.toString();
  var numbers = numStr.split("").map(function(num) {
    return parseInt(num);
  });
  var multipliers = [7, 3, 1];
  var multipliedNumbers = numbers.reverse().map(function(num, idx) {
    return num * multipliers[idx % multipliers.length];
  });
  var summed = multipliedNumbers.reduce(function(ret, val) {
    return ret + val;
  });
  return parseInt((numStr + getValidationValue(summed).toString()));
};

function getValidationValue(num) {
  var inverse = 10 - num % 10;
  return inverse == 10 ? 0 : inverse;
}

exports.formatMessage = function (message) {
  if (!message) return undefined;

  var words = flatMap(_.str.words(message), function (word) {
    return _.str.chop(word, MAX_ROW_LEN)
  });

  var rows = _.reduce(words, function (memo, word) {
    var lastIndex = memo.length-1;
    var currentRow = memo[lastIndex];

    if (currentRow.length == 0) {
      memo[lastIndex] += word;
    } else if (currentRow.length + word.length + 1 <= MAX_ROW_LEN) {
      memo[lastIndex] += ' ' + word;
    } else {
      memo.push(word);
    }

    return memo;
  }, [""]);

  return rows.slice(0, MAX_ROWS).join(LINEBREAK);
};

function flatMap(collection, fun) {
  return _.flatten(_.map(collection, fun));
}

exports.formatDueDate = function (date, defaultValue) {
  return formatOrDefault(date, toParam, defaultValue);

  function toParam(date) {
    return _.str.sprintf("%02d.%02d.%4d",
      date.getDate(), date.getMonth() + 1, date.getFullYear());
  }
};

exports.formatConfirmation = function (confirm, defaultValue) {
  return formatOrDefault(confirm, toParam, defaultValue);

  function toParam(confirm) {
    if (confirm) {
      return "YES";
    } else {
      return "NO";
    }
  }
};

function formatOrDefault(param, formatToParam, defaultValue) {
  if (isNullOrUndefined(param)) {
    return defaultValue;
  } else {
    return formatToParam(param);
  }
}

function isNullOrUndefined(value) {
  return _.isNull(value) || _.isUndefined(value);
}

exports.formatAmount = function (amount) {
  return _.str.numberFormat(amount, 2, ',', '');
};