var config = require("../../../config.json");
var helpers = require('../../../helpers');

require = patchRequire(require);
var x = require('casper').selectXPath;

exports.runTests = function (casper, options) {
  var returnLinkSelector = "//a[span[contains(text(), '"+options.returnLinkText+"')]]";
  var bankId = options.id || options.bankName.toLowerCase();

  casper.test.begin(options.bankName + " Payment", 1, function (test) {
    casper.start('https://localhost:' + config.port, function() {
      this.click("#"+bankId+"-payment");
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

    if (bankId === 'tapiola') {
      casper.waitForSelector(x("//p[contains(text(), 'Ei sallittu demokoodeilla')]"), function() {
        this.click(x(returnLinkSelector));
      });

      casper.waitForSelector('#reject', function () {
        test.assertExists("#reject");
        this.echo("Successfully rejected payment with "+options.bankName+" demo account as stated in the documentation (chapter 8): http://dokumentit.s-pankki.fi/c/document_library/get_file?uuid=18f5dd29-a484-4934-81f5-cadcfd7ff41c&groupId=10140");
      });
    } else {
      casper.waitForSelector('form[name="instantPaymentForm"]', function() {
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
    }

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
};