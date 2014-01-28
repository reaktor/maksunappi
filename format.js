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
}

function getValidationValue(num) {
  var inverse = 10 - num % 10;
  return inverse == 10 ? 0 : inverse;
}