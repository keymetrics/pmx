var net_module = require('net');
var Probe      = require('./Probe.js');

var Network = module.exports = {};

Network.catchPorts = function() {
  var ports_list = [];
  var opened_ports = 'none';

  Probe.probe().metric({
    name    : 'Ports open',
    value   : function() { return opened_ports; }
  });

  var original_listen = net_module.Server.prototype.listen;

  net_module.Server.prototype.listen = function() {

    ports_list.push(parseInt(arguments[0]));
    opened_ports = ports_list.sort().join();

    original_listen.call(this, arguments);
  };
};
