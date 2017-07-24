
var net = require('net');
var dgram = require('dgram');
var shimmer = require('shimmer');
var convertBytes = require('../utils/convertBytes.js');
var Transport = require('../utils/transport.js');

var Network = module.exports = {};

// Test each different way to pass a port to .listen()
function portDetection(options) {
  var port = null;

  if (typeof(options) === 'object' && options.port)
    port = parseInt(options.port);
  else if (typeof(options) === 'object' && options.fd)
    port = options.fd;
  else if (typeof(options) === 'object' && options.path)
    port = options.path;
  else if (!isNaN(parseInt(options)))
    port = parseInt(options);
  else if (typeof(options) === 'string')
    port = options;

  return port;
}

Network.overrideListeningPort = function(base_port) {
  shimmer.wrap(net.Server.prototype, 'listen', function(original) {
    return function() {
      var options = arguments[0];
      var port = portDetection(options);
      var new_port = base_port++;

      if (port) {
        // Notify PM2 of the original listening port
        Transport.send({
          type : 'lb:listening:port',
          data : {
            port : port,
            associated_port : new_port
          }
        });
      }

      arguments[0] = new_port;

      return original.apply(this, arguments);
    }
  });
}

Network.monitorOpenPorts = function() {
  var Probe = require('../..').probe();
  var opened_ports = 'N/A';

  global.__km_open_port_list = [];

  Probe.metric({
    name    : 'Open Ports',
    value   : function() {
      return opened_ports;
    }
  });

  /**
   * NET override to retrieve port
   */
  shimmer.wrap(net.Server.prototype, 'listen', function(original) {
    return function() {
      var options = arguments[0];
      var port = portDetection(options);

      if (port && global.__km_open_port_list.indexOf(port) === -1) {
        global.__km_open_port_list.push(port);
        opened_ports = global.__km_open_port_list.sort().join();
      }

      this.once('close', function() {
        if (global.__km_open_port_list.indexOf(port) > -1) {
          global.__km_open_port_list.splice(global.__km_open_port_list.indexOf(port), 1);
          opened_ports = global.__km_open_port_list.sort().join();
        }
      });

      return original.apply(this, arguments);
    }
  });

  /**
   * UDP dgram override to retrieve port
   */
  shimmer.wrap(dgram.Socket.prototype, 'bind', function(original) {
    return function() {
      var options = arguments[0];
      var port = portDetection(options);

      if (port && global.__km_open_port_list.indexOf(port) === -1) {
        global.__km_open_port_list.push(port);
        opened_ports = global.__km_open_port_list.sort().join();
      }

      this.once('close', function() {
        if (global.__km_open_port_list.indexOf(port) > -1) {
          global.__km_open_port_list.splice(global.__km_open_port_list.indexOf(port), 1);
          opened_ports = global.__km_open_port_list.sort().join();
        }
      });

      return original.apply(this, arguments);
    }
  });
};

Network.monitorBandwidth = function() {
  var Probe = require('../..').probe();
  var download = 0;
  var upload   = 0;
  var up       = '0b/s';
  var down     = '0b/s';

  global.__km_network_download = Probe.metric({
    name     : 'Network Download',
    agg_type : 'sum',
    value    : function() { return down; }
  });

  global.__km_network_upload = Probe.metric({
    name     : 'Network Upload',
    agg_type : 'sum',
    value    : function() { return up; }
  });

  var interval = setInterval(function() {
    up = convertBytes(upload);
    down = convertBytes(download);
    upload = 0;
    download = 0;
  }, 999);

  interval.unref();

  shimmer.wrap(net.Socket.prototype, 'write', function(original) {
    return function() {
      var chunk = arguments[0];
      if (chunk && chunk.length)
        upload += chunk.length;
      return original.apply(this, arguments);
    }
  });

  shimmer.wrap(net.Socket.prototype, 'read', function(original) {
    return function() {
      if (!this.__stream_monitored) {
        this.__stream_monitored = true;

        this.on('data', function(chunk) {
          if (chunk && chunk.length)
            download += chunk.length;
        });
      }

      return original.apply(this, arguments);
    }
  });
};
