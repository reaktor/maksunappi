var _ = require('underscore')._;

// TODO: option to log errors
exports.requireParams = function (params, required) {
  _.each(required, function (key) {
    if (!params[key]) {
      throw new Error("Missing required argument '" + key + "'.");
    }
  });
};