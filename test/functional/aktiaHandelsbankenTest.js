var config = require("../../config.json");
var x = require('casper').selectXPath;
var helpers = require('../../helpers');
var _ = require('underscore')._;

var commonOptions = {
  username: '11111111',
  password: '123456',
  securityCode: '123456'
};

var handelsbankenOptions = _.extend({}, commonOptions, { bankName: 'Handelsbanken' });
var aktiaOptions = _.extend({}, commonOptions, { bankName: 'Aktia' });

var bankOptions = [aktiaOptions, handelsbankenOptions];

_.each(bankOptions, testPayment);
_.each(bankOptions, testCancel);

function testPayment(options) {
  casper.test.begin(options.bankName + " Payment", 1, function (test) {
    casper.start('https://localhost:' + config.port, function() {
      this.click("#"+options.bankName.toLowerCase()+"-payment");
    });

    casper.then(function() {
      this.fill('form', {
        'j_username': options.username,
        'j_password': options.password
      }, true);
    });

    helpers.times(2, function () {
      casper.then(function() {
        this.fill('form[name="VerkkoMaksuHyvaksyForm"]', {
          'turvaluku': options.securityCode
        }, false);
        this.click("input[name='hyvaksy']");
      });
    });

    casper.waitForSelector('#success', function () {
      test.assertExists("#success");
      this.echo("Succesfully paid with "+options.bankName);
    });

    casper.run(function() {
      test.done();
    });
  });
}

function testCancel(options) {
  casper.test.begin(options.bankName+" Payment Cancel", 1, function (test) {

    casper.start('https://localhost:' + config.port, function() {
      this.click("#"+options.bankName.toLowerCase()+"-payment");
    });

    casper.then(function() {
      this.click("input[name='keskeytatunnistus']");
    });

    casper.then(function() {
      this.click(x("//a[contains(text(), 'Paluu kauppapaikalle')]"));
    });

    casper.then(function(){
      test.assertExists("#cancel");
      this.echo("Succesfully canceled payment with "+options.bankName);
    });

    casper.run(function() {
      test.done();
    });
  });
}