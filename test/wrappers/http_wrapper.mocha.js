
var pmx = require('../..');
var request = require('request');
var should = require('should');
var fork = require('child_process').fork;

describe('HTTP Wrapper', function() {
  var app;

  after(function() {
    process.kill(app.pid);
  });

  it('should receive configuration flag', function(done) {
    app = fork(__dirname + '/../fixtures/wrapper_fixtures/app.mock.auto.js', []);;

    app.once('message', function(data) {
      data.type.should.eql('axm:option:configuration');
      done();
    });

  });

  it('should receive automatic custom metrics for HTTP server', function(done) {
    var interval_req;

    var rcpt = function(packet) {
      if (packet.type == 'axm:option:configuration')
        return false;
      if (packet.type == 'axm:monitor') {
        should.exists((packet.data['HTTP'].value));
        should.exists((packet.data['pmx:http:latency'].value));
        app.removeListener('message', rcpt);
        clearInterval(interval_req);
        return done();
      }
    };

    app.on('message', rcpt);

    interval_req = setTimeout(function() {
      request('http://127.0.0.1:9007/', function(req, res) {});
    }, 10);
  });

});
