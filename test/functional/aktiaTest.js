var tests = require('./shared/NETSharedTest');

var options = {
  bankName: 'Aktia',
  username: '11111111',
  password: '123456',
  securityCode: '123456'
};

tests.testPayment(casper, options);
tests.testCancel(casper, options);