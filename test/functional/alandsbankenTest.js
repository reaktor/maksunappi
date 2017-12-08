var config = require("../../../config.json");
var helpers = require('../../../helpers');

require = patchRequire(require);
var x = require('casper').selectXPath;

var options = {
  bankName: 'Alandsbanken',
  id: 'alandsbanken',
  username: '12345678',
  password: '123456',
  securityCode: '9999',
  returnLinkText: 'Takaisin myyjän sivuille'
};

var returnLinkSelector = "//a[contains(text(), '"+options.returnLinkText+"')]";
var bankId = options.id || options.bankName.toLowerCase();

casper.test.begin(options.bankName + " Payment", 1, function (test) {
  casper.start('https://localhost:' + config.port, function() {
    this.click("#"+bankId+"-payment");
  });

  casper.waitForSelector('a[href="#PIN_TAN"]', function() {
    this.click('a[href="#PIN_TAN"]');
  });

  casper.waitForSelector('form[name="loginForm"]',function() {
    casper.then(function() {
      this.fill('form[name="loginForm"]', {
        'username': options.username,
        'password': options.password
      }, true);
    });
  });

  casper.waitForSelector('form[name="loginPinForm"]',function() {
    this.fill('form[name="loginPinForm"]', {
      'pinCode': options.securityCode
    }, true);
  });

  casper.waitForSelector('form[name="instantPaymentForm"]', function() {
    this.evaluate(function() {
      document.querySelector('select').selectedIndex = 1;
      return true;
    });
    this.fill('form[name="instantPaymentForm"]', {
      'pincode': options.securityCode
    }, false);
    this.click('button[type="submit"][name="btn_accept"]');
  });

  casper.waitForSelector(x(returnLinkSelector), function() {
    this.click(x(returnLinkSelector));
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

  casper.then(function() {
    this.click(x(returnLinkSelector));
  });

  casper.then(function(){
    test.assertExists("#cancel");
    this.echo("Succesfully canceled payment with "+options.bankName);
  });

  casper.run(function() {
    test.done();
  });
});
