var crypto = require("crypto")
  , events = require('events')
  , _ = require('underscore')._
  , express = require('express');

exports.create = function (config) {
  var paymentGen = Object.create(events.EventEmitter.prototype);

  paymentGen.paymentButton = function (options) {
    return "";
  };

  paymentGen.banks = [];

  return paymentGen;
};