var _ = require('underscore')._;
var helpers = require('./helpers');

exports.toFinnishPaymentReference = function(numericIdentifier) {
  var numStr = numericIdentifier.toString();
  var digits = numStr.split("").map(function(num) {
    return parseInt(num);
  });

  var multipliers = [7, 3, 1];
  var reversedMultiplierSeq = cycleUpto(multipliers, digits.length);
  var weightedIdentifier = _.zip(reversedMultiplierSeq, digits.reverse());
  var weightedSum = helpers.sum(_.map(weightedIdentifier, function (pair) {
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
  return helpers.flatMap(_.range(times), function (_) { return collection; });
}