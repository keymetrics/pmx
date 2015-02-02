
var debug = require('debug')('axm:events');
var Transport = require('./utils/transport.js');

var Options = {};

Options.monitorPID = function(pid) {
  Transport.send({
    type : 'axm:option:setPID',
    data : {
      pid : pid
    }
  }, false);
};

Options.configureModule = function(opts) {
  Transport.send({
    type : 'axm:option:configuration',
    data : opts
  }, false);
};

Options.keepAlive = function() {
  setInterval(function() {}, 100000);
};

Options.setPID = Options.monitorPID;

module.exports = Options;
