var config = require("../../../config.json");
var helpers = require('../../../helpers');

require = patchRequire(require);
var x = require('casper').selectXPath;

exports.testPayment = function (casper, options) {
  casper.test.begin(options.bankName + " Payment", 1, function (test) {
    casper.start('https://localhost:' + config.port, function() {
      this.click("#"+(options.id || options.bankName.toLowerCase())+"-payment");
    });

    casper.then(function() {
      this.fill('form[name="loginForm"]', {
        'username': options.username,
        'password': options.password
      }, true);
    });

    casper.waitForSelector('form[name="loginPinForm"]',function() {
      this.fill('form[name="loginPinForm"]', {
        'pinCode': options.securityCode
      }, true);
    });

    casper.waitForSelector('form[name="instantPaymentForm"]', function() {
      this.fill('form[name="instantPaymentForm"]', {
        'pincode': options.securityCode
      }, false);
      this.click('button[type="submit"][name="btn_accept"]');
    });

    casper.waitForSelector(x("//a[contains(text(), '"+options.returnLinkText+"')]"), function() {
      this.click(x("//a[contains(text(), '"+options.returnLinkText+"')]"));
    });

    casper.waitForSelector('#success', function () {
      test.assertExists("#success");
      this.echo("Succesfully paid with "+options.bankName);
    });

    casper.run(function() {
      test.done();
    });
  });
};

exports.testCancel = function (casper, options) {
  casper.test.begin(options.bankName+" Payment Cancel", 1, function (test) {

    casper.start('https://localhost:' + config.port, function() {
      this.click("#"+(options.id || options.bankName.toLowerCase())+"-payment");
    });

    casper.then(function() {
      this.click(x("//a[contains(text(), '"+options.returnLinkText+"')]"));
    });

    casper.then(function(){
      test.assertExists("#cancel");
      this.echo("Succesfully canceled payment with "+options.bankName);
    });

    casper.run(function() {
      test.done();
    });
  });
};