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

    if (!isNaN(port) && ports_list.indexOf(port) === -1) {
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

Network.catchTraffic = function() {
  var download = 0;
  var upload   = 0;
  var up       = '0 B/sec';
  var down     = '0 B/sec';

  var filter = function(bytes) {
    if (bytes < 1024)
      return (bytes + ' B/s');
    else if (bytes < 1024 * 1024)
      return (parseInt(bytes / 1024) + ' KB/s');
    else
      return ((bytes / (1024 * 1024)).toFixed(1) + ' MB/s');
  };

  setInterval(function() {
    up = filter(upload);
    down = filter(download);
    upload = 0;
    download = 0;
  }, 999);

  Probe.probe().metric({
    name     : 'Network Download',
    agg_type : 'sum',
    value    : function() { return down; }
  });

  Probe.probe().metric({
    name     : 'Network Upload',
    agg_type : 'sum',
    value    : function() { return up; }
  });

  var original_write = net_module.Socket.prototype.write;

  net_module.Socket.prototype.write = function(data) {
    if (data.length)
      upload += data.length;
    return original_write.apply(this, arguments);
  };

  var original_read = net_module.Socket.prototype.read;

  net_module.Socket.prototype.read = function() {

    if (!this.monitored) {
      this.monitored = true;

      this.on('data', function(data) {
        if (data.length)
          download += data.length;
      });
    }

    return original_read.apply(this, arguments);
  };
};
