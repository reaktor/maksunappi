var _ = require('underscore')._;
_.str = require('underscore.string');
var sprintf = require("sprintf-js").sprintf;
var helpers = require('./helpers');
var logger = require('./logger').getLogger();
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
};

exports.formatBoolean = function (boolean, format) {
  var formatter = format || exports.booleanFormats.YesOrNo;
  return formatter[!!boolean];
};

exports.formatVersionNumber = function (versionStr, toLength) {
  var len = toLength || 1;
  if(versionStr) {
    return sprintf('%0'+len+'d', parseInt(versionStr.toString()));
  }
  else return undefined

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

  var maxRows = rowLimit || MAX_ROWS;
  var slicedMessage = rows.slice(0, maxRows).join(LINEBREAK);

  if (rows.length > maxRows) {
    logger.warn("Message was shortened due to row count limit. The new message is:\n"
      + slicedMessage);
  }

  return slicedMessage;
};

exports.formatDueDate = function (date) {
  if (date == 'EXPRESS' || date == 'HETI') {
    return date;
  } else if (date && helpers.lessThanIgnoreTime(date, new Date())) {
    logger.warn("Due date: " + date.toUTCString() + " was before today." +
      " Changing Due date to be today");
    return exports.dueDateToday();
  } else {
    return dueDate(date);
  }
};

function dueDate(date) {
  return sprintf("%02d.%02d.%4d",
    date.getDate(), date.getMonth() + 1, date.getFullYear());
}

exports.dueDateToday = function () {
  return dueDate(new Date());
};

exports.formatAmount = function (amount) {
  var value = parseFloat(amount);
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
