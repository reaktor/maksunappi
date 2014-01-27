var express = require('express'),
    https = require('https'),
    fs = require('fs'),
    _ = require('underscore')._,
    app = express();

var options = {
  appHandler: app,
  hostUrl: "https://localhost:8081"
};

var payments = require(__dirname + '/../payment').create(options);

payments.on('success', function (req, res) {
  console.log(req.query);
  res.send("<html><h1 id='success'>SUCCESS</h1></html>");
});

payments.on('mac-check-failed', function (req, res) {
  res.send(400, "<html><h1 id='mac-check-failed'>MAC-CHECK-FAILED</h1></html>");
});

payments.on('cancel', function (req, res) {
  res.send("<html><h1 id='cancel'>CANCEL</h1></html>");
});

payments.on('reject', function (req, res) {
  res.send("<html><h1 id='reject'>REJECT</h1></html>");
});

var sslOptions = {
  key: fs.readFileSync(__dirname + '/certs/server.key'),
  cert: fs.readFileSync(__dirname + '/certs/server.crt'),
  ca: fs.readFileSync(__dirname + '/certs/ca.crt'),
  requestCert: false,
  rejectUnauthorized: false
};

app.use(express.static(__dirname + '/css'))

app.get('/', function (req, res) {
  var bankForms = _.map(payments.banks, function (bankId) {
    return payments.paymentButton(bankId, {});
  });

  var html = "<html>"+
    "<head><link rel='stylesheet' type='text/css' href='app.css'></head>"+
    "<body><div class='payment-buttons'>" + bankForms.join("") + "</div></body>"+
    "</html>";

  res.send(html);
});

var server = https.createServer(sslOptions, app);

exports = module.exports = server;
exports.use = function() {
  app.use.apply(app, arguments);
};
