var config = require("../../../config.json");
var helpers = require('../../../helpers');

require = patchRequire(require);
var x = require('casper').selectXPath;

exports.runTests = function (casper, options) {
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

  casper.test.begin(options.bankName+" Payment Cancel", 1, function (test) {

    casper.start('https://localhost:' + config.port, function() {
      this.click("#"+options.bankName.toLowerCase()+"-payment");
    });

    casper.then(function() {
      this.click("input[name='keskeytatunnistus']");
    });

    casper.then(function() {
      this.click(x("//a[contains(text(), 'Paluu')]"));
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
