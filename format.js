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