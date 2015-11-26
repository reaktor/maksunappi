var express = require('express'),
    https = require('https'),
    fs = require('fs'),
    _ = require('underscore')._,
    moment = require("moment"),
    app = express(),
    winston = require('winston');


var logger = new (winston.Logger)({
  transports: [new (winston.transports.Console)({level : "warn"})]
});

var options = {
  appHandler: app,
  hostUrl: "https://localhost:8081",
  logger : logger
};

var payments = require(__dirname + '/../payment').create(options);

payments.on('success', function (req, res, data) {
  console.log(req.query);
  console.log(data);
  res.status(200).send("<html><h1 id='success'>SUCCESS</h1></html>");
});

payments.on('mac-check-failed', function (req, res, data) {
  res.status(400).send("<html><h1 id='mac-check-failed'>MAC-CHECK-FAILED</h1></html>");
});

payments.on('cancel', function (req, res) {
  res.status(200).send("<html><h1 id='cancel'>CANCEL</h1></html>");
});

payments.on('reject', function (req, res) {
  res.status(200).send("<html><h1 id='reject'>REJECT</h1></html>");
});

var sslOptions = {
  key: fs.readFileSync(__dirname + '/certs/server.key'),
  cert: fs.readFileSync(__dirname + '/certs/server.crt'),
  ca: fs.readFileSync(__dirname + '/certs/ca.crt'),
  requestCert: false,
  rejectUnauthorized: false
};

app.use(express.static(__dirname + '/css'));

app.get('/', function (req, res) {
  var requestId = moment().format('YYYYMMDDhhmmss');

  var bankForms = _.map(payments.banks, function (bankId) {
    return payments.paymentButton(bankId, {
      requestId: requestId,
      amount: 5000,
      messageForBankStatement: "Lorem ipsum dolor sit amet",
      messageForWebForm: "Lorem ipsum dolor sit amet (webform)",
      reference : payments.referenceNumbers.toFinnishPaymentReference(requestId)
    });
  });

  var html = "<html>"+
    "<head><link rel='stylesheet' type='text/css' href='app.css'></head>"+
    "<body><div class='payment-buttons'>" + bankForms.join("") + "</div></body>"+
    "</html>";

  res.status(200).send(html);
});

var server = https.createServer(sslOptions, app);

exports = module.exports = server;
exports.use = function() {
  app.use.apply(app, arguments);
};
