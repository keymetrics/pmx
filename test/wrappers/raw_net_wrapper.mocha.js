
var netWrapper = require('../../lib/wrapper/net_wrapper.js');
var should = require('should');
var net = require('net');
var fs = require('fs');
var http = require('http');
var dgram = require('dgram');

function createTcpServer(options) {
  var server = net.createServer();
  server.listen(options);
  return server;
}

function createUdpServer(options) {
  var socket = dgram.createSocket('udp4');
  socket.bind(options);
  return socket;
}

function createHttpServer(options) {
  var server = http.createServer(function(req, res) {
    res.writeHead(200);
  });
  server.listen(options);
  return server;
}

describe('Net Wrapper Raw test', function() {
  it('should start wrapper', function() {
    netWrapper.monitorOpenPorts();
  });

  describe('Net', function() {
    after(function() {
      should(global.__km_open_port_list.length).eql(0);
    });

    it('should instanciate net server simple (port as a int)', function() {
      var server = createTcpServer(9876);
      should(global.__km_open_port_list.indexOf(9876)).not.eql(-1);
      server.close();
    });

    it('should instanciate net (port as a string)', function() {
      var server = createTcpServer('9876');
      should(global.__km_open_port_list.indexOf(9876)).not.eql(-1);
      server.close();
    });

    it('should instanciate net (option object with port)', function() {
      var server = createTcpServer({ port : '9800' });
      should(global.__km_open_port_list.indexOf(9800)).not.eql(-1);
      server.close();
    });

    it('should instanciate net (socket path)', function() {
      var server = createTcpServer({ path : './test.sock' });
      should(global.__km_open_port_list.indexOf('./test.sock')).not.eql(-1);
      server.close();
    });

    it('should instanciate net (direct path)', function() {
      var server = createTcpServer('toto.sock');
      should(global.__km_open_port_list.indexOf('toto.sock')).not.eql(-1);
      server.close();
    });

    it('should instanciate net (filedescriptor)', function() {
      var server = createTcpServer({ fd : 3 });
      should(global.__km_open_port_list.indexOf(3)).not.eql(-1);
      server.close();
    });

  });

  describe('HTTP (using net)', function() {
    after(function() {
      should(global.__km_open_port_list.length).eql(0);
    });

    it('should work also with http server', function() {
      var server = createHttpServer('toto.sock');
      should(global.__km_open_port_list.indexOf('toto.sock')).not.eql(-1);
      server.close();
    });
  });

  describe('UDP', function() {
    after(function() {
      should(global.__km_open_port_list.length).eql(0);
    });

    it('should find port (simple int)', function() {
      var server = createUdpServer(9000);
      should(global.__km_open_port_list.indexOf(9000)).not.eql(-1);
      server.close();
    });

    it('should find port (object)', function() {
      var server = createUdpServer({port : 9002});
      should(global.__km_open_port_list.indexOf(9002)).not.eql(-1);
      server.close();
    });
  });


});
