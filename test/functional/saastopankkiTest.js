var tests = require('./shared/NETSharedTest');

var options = {
  bankName: 'Saastopankki',
  username: '11111111',
  password: '123456',
  securityCode: '123456'
};

tests.runTests(casper, options);