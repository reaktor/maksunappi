var config = require("../../../config.json");
var helpers = require('../../../helpers');

require = patchRequire(require);
var x = require('casper').selectXPath;

var options = {
  bankName: 'Aktia',
  username: '12345678',
  password: '123456',
  securityCode: '1234'
};

var bankId = options.id || options.bankName.toLowerCase();

casper.test.begin(options.bankName + " Payment", 1, function (test) {
  casper.start('https://localhost:' + config.port, function() {
    this.click("#"+bankId+"-payment");
  });

  casper.then(function() {
    this.fill('form[name="Login"]', {
      'IDToken1': options.username,
      'IDToken2': options.password
    }, true);
  });

  casper.waitForSelector('form[name="Login"]',function() {
    this.fill('form[name="Login"]', {
      'IDToken1': options.securityCode
    }, true);
  });


  casper.waitForSelector('form[name="confirm_online_payment_form"]', function() {
    this.fill('form[name="confirm_online_payment_form"]', {
      'otc': options.securityCode
    }, false);
    this.click("#pin-confirmation-confirm-button");
  });

  casper.waitForSelector("#redirectLink", function() {
    this.click("#redirectLink");
  });


  casper.waitForSelector('#success', function () {
    test.assertExists("#success");
    this.echo("Succesfully paid with "+options.bankName);
  });

  casper.run(function() {
    test.done();
  });
});

casper.test.begin(options.bankName+" Payment Cancel", 1, function (test) {

  casper.start('https://localhost:' + config.port, function() {
    this.click("#"+bankId+"-payment");
  });

  casper.waitForSelector('.cancel', function() {
    this.click(".cancel");
  });

  casper.then(function(){
    test.assertExists("#cancel");
    this.echo("Succesfully canceled payment with "+options.bankName);
  });

  casper.run(function() {
    test.done();
  });
});
