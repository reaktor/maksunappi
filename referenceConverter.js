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

// http://www.fkl.fi/teemasivut/sepa/tekninen_dokumentaatio/Dokumentit/RF-viitteen_kayttoonotto_Suomessa_1.12.2010.pdf
exports.toRFReference = function(finnishReferenceNumber) {
  var RFtoStr = "271500"
  var refStr = finnishReferenceNumber.toString() + RFtoStr;
  var checksumStr = rfCheckNumber(refStr);
  return "RF" + checksumStr + finnishReferenceNumber.toString();
};

function rfCheckNumber(refStr) {
  var remainder = modulo(refStr , 97);
  var num = 98 - remainder;
  return num < 10 ? "0" + parseInt(num) : num.toString();

}

function referenceCheckNumber(sum) {
  var inverse = 10 - sum % 10;
  return inverse == 10 ? 0 : inverse;
}

//to avoid integeroverflow
function modulo(divident, divisor) {
  var partLength = 10;

  while (divident.length > partLength) {
    var part = divident.substring(0, partLength);
    divident = (part % divisor) +  divident.substring(partLength);
  }

  return divident % divisor;
}

function cycleUpto(collection, length) {
  return cycle(collection, Math.ceil(length / collection.length)).slice(0, length);
}

function cycle(collection, times) {
  return helpers.flatMap(_.range(times), function (_) { return collection; });
}