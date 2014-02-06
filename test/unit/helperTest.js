var assert = require("assert");
var helpers = require('../../helpers');

describe('Date parsing', function () {
  it('should parse dates in yyyymmdd format to Date objects', function () {
    var date = helpers.parseDate("20140206");
    assert.equal(date.getDate(), 6);
    assert.equal(date.getMonth(), 1);
    assert.equal(date.getFullYear(), 2014);
  });
});