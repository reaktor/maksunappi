var config = require("../../config.json");
var x = require('casper').selectXPath;

casper.test.begin("Nordea Payment", 1, function(test) {
  casper.start('https://localhost:' + config.port, function() {
    this.click("#nordea-payment");
  });

  casper.then(function() {
    this.fill('form[name="A232202Y"]', {
      'A02Y_USERID': '123456',
      'A02Y_IDNBR': '1111'
    }, true);
  });

  casper.then(function() {
    this.fill('form[name="A232203Y"]', {
      'A03Y_PMTCONNB': '1111'
    }, true);
  });

  casper.then(function() {
    this.click("input[type='button']");
  });
  casper.then(function(){
    test.assertExists("#success");
    this.echo("Succesfully paid with Nordea");
  });

  casper.run(function() {
    test.done();
  });
});

casper.test.begin("Nordea Payment Cancel", 1, function(test) {

  casper.start('https://localhost:' + config.port, function() {
    this.click("#nordea-payment");
  });

  casper.then(function() {
    this.click("input[name='A02Y_DELEBTN']");
  });

  casper.then(function() {
    this.click(x("//a[contains(text(), 'Paluu myyjälle')]"));
  });

  casper.then(function(){
    test.assertExists("#cancel");
    this.echo("Succesfully canceled payment with Nordea");
  });

  casper.run(function() {
    test.done();
  });
});
