// Provider stub
var _ = require('underscore')._;
_.str = require('underscore.string');

exports.mapParams = function (providerConfig, options) {
  // TODO: parameter validation

  return {
    SOLOPMT_VERSION: providerConfig.paymentVersion,
    SOLOPMT_STAMP: options.requestId,
    SOLOPMT_RCV_ID: providerConfig.vendorId,
    SOLOPMT_LANGUAGE: formatLanguage(options.language),
    SOLOPMT_AMOUNT: formatAmount(options.amount),
    SOLOPMT_REF: options.paymentReference,
    SOLOPMT_DATE: formatDueDate(options.dueDate, providerConfig.dueDate),
    SOLOPMT_MSG: formatMessage(options.message),
    SOLOPMT_RETURN: providerConfig.returnUrls.ok,
    SOLOPMT_CANCEL: providerConfig.returnUrls.cancel,
    SOLOPMT_REJECT: providerConfig.returnUrls.reject,
    SOLOPMT_CONFIRM: formatConfirmation(options.confirm, providerConfig.confirm),
    SOLOPMT_KEYVERS: providerConfig.keyVersion,
    SOLOPMT_CUR: providerConfig.currency,
    SOLOPMT_PMTTYPE: options.mobile ? 'M' : undefined,
    SOLOPMT_RCV_ACCOUNT: providerConfig.vendorAccount,
    SOLOPMT_RCV_NAME: providerConfig.vendorName
    // TODO: MAC
  };
};

function formatMessage(message) {
  if (!message) return undefined;

  var MAX_ROW_LEN = 35;
  var MAX_ROWS = 6;
  var LINEBREAK = '\r\n';

  var words = flatMap(_.str.words(message), function (word) {
    return _.str.chop(word, MAX_ROW_LEN)
  });

  var rows = [];
  var currentRow = "";

  _.each(words, function (word) {
    if (currentRow.length == 0) {
      currentRow += word;
    } else if (currentRow.length + word.length + 1 <= MAX_ROW_LEN) {
      currentRow += ' ' + word;
    } else {
      rows.push(currentRow);
      currentRow = word;
    }
  });

  return _.str.join(LINEBREAK, rows.slice(0, MAX_ROWS));
}

function flatMap(collection, fun) {
  return _.flatten(_.map(collection, fun));
}

function formatDueDate(date, defaultValue) {
  return formatOrDefault(date, toParam, defaultValue);

  function toParam(date) {
    return _.str.sprintf("%02d.%02d.%4d",
      date.getDate(), date.getMonth() + 1, date.getFullYear());
  }
}

function formatConfirmation(confirm, defaultValue) {
  return formatOrDefault(confirm, toParam, defaultValue);

  function toParam(confirm) {
    if (confirm) {
      return "YES";
    } else {
      return "NO";
    }
  }
}

function formatOrDefault(param, formatToParam, defaultValue) {
  if (_.isNull(param) || _.isUndefined(param)) {
    return defaultValue;
  } else {
    return formatToParam(param);
  }
}

function formatAmount(amount) {
  return _.str.numberFormat(amount, 2, ',', '');
}

function formatLanguage(langCode) {
  if (!langCode) return 1;

  switch (langCode.toUpperCase()) {
    case "FI": return 1;
    case "SV": return 2;
    case "EN": return 3;
    default: throw "Unsupported language code '" + langCode + "'.";
  }
}