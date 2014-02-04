var _ = require('underscore')._;
_.str = require('underscore.string');
var helpers = require('./helpers');

var MAX_ROW_LEN = 35;
var MAX_ROWS = 6;
var LINEBREAK = '\r\n';
var DEFAULT_LANGUAGE = 1;

exports.booleanFormats = {
  YesOrNo: {
    true: 'YES',
    false: 'NO'
  },
  KOrE: {
    true: 'K',
    false: 'E'
  }
};

exports.languageFormats = {
  allowEnglish: {
    FI: DEFAULT_LANGUAGE,
    SV: 2,
    EN: 3
  },
  mapEnglishToDefault: {
    FI: DEFAULT_LANGUAGE,
    SV: 2,
    EN: DEFAULT_LANGUAGE
  }
}

exports.formatBoolean = function (boolean, format) {
  var formatter = format || exports.booleanFormats.YesOrNo;
  return formatter[!!boolean];
};

exports.formatVersionNumber = function (versionStr, toLength) {
  var len = toLength || 1;
  return _.str.sprintf('%0'+len+'d', parseInt(versionStr.toString()));
};

exports.formatMessage = function (message, rowLimit) {
  if (!message) return undefined;

  var words = helpers.flatMap(_.str.words(message.trim()), function (word) {
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

  return rows.slice(0, rowLimit || MAX_ROWS).join(LINEBREAK);
};

exports.formatDueDate = function (date, defaultValue) {
  // TODO: log a warning if this changes the date?
  if (date == 'EXPRESS' || date == 'HETI') {
    return date;
  } else if (date && helpers.lessThanIgnoreTime(date, new Date())) {
    return exports.dueDateToday();
  } else {
    return formatOrDefault(date, dueDate, defaultValue);
  }
};

function dueDate(date) {
  return _.str.sprintf("%02d.%02d.%4d",
    date.getDate(), date.getMonth() + 1, date.getFullYear());
}

exports.dueDateToday = function () {
  return dueDate(new Date());
};

function formatOrDefault(param, formatToParam, defaultValue) {
  if (helpers.isNullOrUndefined(param)) {
    return defaultValue;
  } else {
    return formatToParam(param);
  }
}

exports.formatAmount = function (amount) {
  var value = parseInt(amount);
  if (isNaN(value)) {
    throw new Error("Invalid amount: '" + amount + "'.");
  } else {
    return _.str.numberFormat(value, 2, ',', '');
  }
};

exports.formatLanguage = function (langCode, mapping) {
  if (!langCode) return DEFAULT_LANGUAGE;

  var converted = mapping[langCode.toUpperCase()];
  if (!converted) {
    throw new Error("Unsupported language code '" + langCode + "'.");
  }

  return converted;
};