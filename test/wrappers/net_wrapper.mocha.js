
var netWrapper = require('../../lib/wrapper/net_wrapper.js');
var should = require('should');
var net = require('net');

describe('NET Wrapper', function() {
  var client, server;

  after(function() {
    server.close();
  });

  it('should enable traffic monitoring', function() {
    netWrapper.catchTraffic();
    should.exists(global.__km_network_download);
    should.exists(global.__km_network_upload);
  });

  it('should create server and client', function(done) {
    var ok = false;
    server = net.createServer(function(socket) {
      socket.on('data', function(data) {
        if (ok == false) {
          ok = true;
          done();
        }
      });
    });

    server.listen(9876, function() {
    });

    client = net.connect({port: 9876}, function() {
      setInterval(function() {
        client.write('world!\r\n');
      }, 100);
    });
  });

  it('should monitor traffic', function() {
    setTimeout(function() {
      should(parseFloat(global.__km_network_download.val())).be.above(0);
      should(parseFloat(global.__km_network_upload.val())).be.above(0);
    }, 2000);
  });


});
