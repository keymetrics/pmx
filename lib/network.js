var net_module = require('net');
var Probe      = require('./Probe.js');

var Network = module.exports = {};

Network.catchPorts = function() {
  var ports_list = [];
  var opened_ports = 'N/A';

  Probe.probe().metric({
    name    : 'Open ports',
    value   : function() { return opened_ports; }
  });

  var original_listen = net_module.Server.prototype.listen;

  net_module.Server.prototype.listen = function() {
    var port = parseInt(arguments[0]);

    if (!isNaN(port)) {
      ports_list.push(port);
      opened_ports = ports_list.sort().join();
    }

    this.once('close', function() {
      if (ports_list.indexOf(port) > -1) {
        ports_list.splice(ports_list.indexOf(port), 1);
        opened_ports = ports_list.sort().join();
      }
    });

    return original_listen.apply(this, arguments);
  };
};
