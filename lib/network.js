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

    ports_list.push(port);
    opened_ports = ports_list.sort().join();

    this.once('close', function() {
      ports_list.splice(ports_list.indexOf(port), 1);
      opened_ports = ports_list.sort().join();
    });

    return original_listen.apply(this, arguments);
  };
};

Network.catchTraffic = function() {
  var download = 0;
  var upload   = 0;

  Probe.probe().metric({
    name    : 'Download',
    value   : function() { return download; }
  });

  Probe.probe().metric({
    name    : 'Upload',
    value   : function() { return upload; }
  });

  var original_read = net_module.Socket.prototype.read;

  net_module.Socket.prototype.read = function(n) {
    download += n;
    return original_read.apply(this, arguments);
  };

  var original_write = net_module.Socket.prototype.write;

  net_module.Socket.prototype.write = function(data) {
    upload += data.length;
    return original_write.apply(this, arguments);
  };
};
