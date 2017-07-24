
var should = require('should');
var net = require('net');
var fork = require('child_process').fork;

describe('NET Wrapper', function() {
  var client, server;

  this.timeout(4000);

  describe('Monitor Net Traffic Bandwidth', function() {
    var app;

    after(function() {
      process.kill(app.pid);
    });

    it('should start mock app with port option enabled', function(done) {
      app = fork(__dirname + '/../fixtures/wrapper_fixtures/net_server.js', []);

      app.once('message', function(data) {
        data.type.should.eql('axm:option:configuration');
        done();
      });
    });

    it('should hit net server and see bandwidth usage changing', function(done) {
      var send_interval;

      var rcpt = function(packet) {
        if (packet.type == 'axm:monitor') {
          should(packet.data['Open Ports'].value).eql('9876');
          should.exists(packet.data['Network Upload']);
          if (parseFloat(packet.data['Network Upload'].value) <= 0)
            return false;
          clearInterval(send_interval);
          app.removeListener('message', rcpt);
          return done();
        }
      };

      setTimeout(function() {
        app.on('message', rcpt);
      }, 500);

      setTimeout(function() {
        client = net.connect({port: 9876}, function() {
          send_interval = setInterval(function() {
            client.write(new Buffer(9999).fill('a') + '\r\n');
          }, 50);
        });
      }, 100);
    });
  });

  describe('Retrieve listening ports', function() {
    var app;

    after(function() {
      process.kill(app.pid);
    });

    it('should start mock app with port option enabled', function(done) {
      app = fork(__dirname + '/../fixtures/wrapper_fixtures/http_server.js', []);

      app.once('message', function(data) {
        data.type.should.eql('axm:option:configuration');
        done();
      });
    });

    it('should receive port which app is listening on', function(done) {
      var rcpt = function(packet) {
        if (packet.type == 'axm:monitor') {
          should(packet.data['Open Ports'].value).eql('9007');
          app.removeListener('message', rcpt);
          return done();
        }
      };

      app.on('message', rcpt);
    });


  });

});
