var payment = require('../../payment');

exports.create = function () {
  var app = require('express')();
  var hostUrl = 'https://localhost:8081';
  return payment.create({
    appHandler: app,
    hostUrl: hostUrl
  });
};