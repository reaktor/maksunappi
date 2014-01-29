var _ = require('underscore')._;
_.str = require('underscore.string');

var MAX_ROW_LEN = 35;
var MAX_ROWS = 6;
var LINEBREAK = '\r\n';
var DEFAULT_LANGUAGE = 1;

exports.formatToPaymentReference = function(numericIdentifier) {
  var numStr = numericIdentifier.toString();
  var digits = numStr.split("").map(function(num) {
    return parseInt(num);
  });

  var multipliers = [7, 3, 1];
  var reversedMultiplierSeq = cycleUpto(multipliers, digits.length);
  var weightedIdentifier = _.zip(reversedMultiplierSeq, digits.reverse());
  var weightedSum = sum(_.map(weightedIdentifier, function (pair) {
    return pair[0] * pair[1];
  }));

  return numStr + referenceCheckNumber(weightedSum).toString();
};

function referenceCheckNumber(sum) {
  var inverse = 10 - sum % 10;
  return inverse == 10 ? 0 : inverse;
}

function cycleUpto(collection, length) {
  return cycle(collection, Math.ceil(length / collection.length)).slice(0, length);
}

function cycle(collection, times) {
  return flatMap(_.range(times), function (_) { return collection; });
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

function sum(collection) {
  return _.reduce(collection, function (acc, n) { return acc + n; }, 0);
}

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

exports.allowEnglish = {
  FI: DEFAULT_LANGUAGE,
  SV: 2,
  EN: 3
};

exports.mapEnglishToDefault = {
  FI: DEFAULT_LANGUAGE,
  SV: 2,
  EN: DEFAULT_LANGUAGE
};

exports.formatLanguage = function (langCode, mapping) {
  if (!langCode) return DEFAULT_LANGUAGE;

  var converted = mapping[langCode.toUpperCase()];
  if (!converted) {
    throw new Error("Unsupported language code '" + langCode + "'.");
  }

  return converted;
};