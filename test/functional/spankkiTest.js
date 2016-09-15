var tests = require('./shared/AABSharedTest');

var options = {
  bankName: 'S-Pankki',
  id: 'spankki',
  username: '12345678',
  password: '123456',
  securityCode: '1234',
  returnLinkText: 'Palaa takaisin verkkokauppaan'
};

tests.runTests(casper, options);