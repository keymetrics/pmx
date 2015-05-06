var net   = require('net');
var Probe = require('./Probe.js');

var Network = module.exports = {};

Network.catchPorts = function() {
  var ports_list = [];
  var opened_ports = 'N/A';

  Probe.probe().metric({
    name    : 'Open ports',
    value   : function() { return opened_ports; }
  });

  var original = net.createServer;

  net.createServer = function() {
    var port = null;
    var server = original.apply(this, arguments);

    server.on('listening', function() {
      port = parseInt(server.address().port);
      if (!isNaN(port) && ports_list.indexOf(port) === -1) {
        ports_list.push(port);
        opened_ports = ports_list.sort().join();
      }
    });

    server.on('close', function() {
      if (ports_list.indexOf(port) > -1) {
        ports_list.splice(ports_list.indexOf(port), 1);
        opened_ports = ports_list.sort().join();
      }
    });

    return server;
  };
};
