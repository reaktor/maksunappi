var config = require("../../config.json");
var x = require('casper').selectXPath;

casper.test.begin("OP Payment", 1, function(test) {
  casper.start('https://localhost:' + config.port, function() {
    this.click("#op-payment");
  });

  casper.then(function() {
    this.fill('form[name="lomake"]', {
      'id': '123456',
      'pw': '7890'
    }, true);
  });

  casper.then(function() {
    this.fill('form[name="lomake"]', {
      'avainluku': '1111'
    }, true);
  });

  casper.then(function() {
    this.click('input[type="submit"][value="Hyväksy"]');
  });

  casper.waitForSelector('#success', function() {
    test.assertExists("#success");
    this.echo("Succesfully authenticated with OP");
  }, function(){}, 10000);


  casper.run(function() {
    test.done();
  });
});

casper.test.begin("OP Payment Cancel", 1, function(test) {

  casper.start('https://localhost:' + config.port, function() {
    this.click("#op-payment");
  });

  casper.then(function() {
    this.click(x("//a[contains(text(), 'Keskeytä')]"));
  });

  casper.then(function() {
    this.click(x("//a[contains(text(), 'Palaa palveluntarjoajan sivulle')]"));
  });

  casper.then(function(){
    test.assertExists("#cancel");
    this.echo("Succesfully canceled payment with OP");
  });

  casper.run(function() {
    test.done();
  });
});
