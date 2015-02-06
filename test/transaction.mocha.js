
var axm = require('..');
var request = require('request');
var should = require('should');

function fork() {
  return require('child_process').fork(__dirname + '/transaction/app.mock.js', []);
}

describe('AXM transaction', function() {
  var app;

  it('should have right properties', function(done) {
    axm.should.have.property('http');
    done();
  });

  after(function() {
    process.kill(app.pid);
  });



  it('should receive configuration flag', function(done) {
    app = fork();

    app.once('message', function(data) {
      data.type.should.eql('axm:option:configuration');
      done();
    });
  });

  it('should not log fast http request', function(done) {
    var rcpt = function(data) {
      if (data.type == 'axm:option:configuration')
        return false;
      if (data.type == 'axm:monitor')
        return false;

      return data.type.should.not.eql('http:transaction');
    };

    app.on('message', rcpt);

    setTimeout(function() {
      app.removeListener('message', rcpt);
      return done();
    }, 500);

    setTimeout(function() {
      request('http://127.0.0.1:9007/', function(req, res) {});
    }, 100);
  });

  it('should log slow http request', function(done) {
    app.on('message', function(data) {
      if (data.type == 'axm:option:configuration')
        return false;
      if (data.type == 'axm:monitor')
        return false;

      data.type.should.eql('http:transaction');
      data.data.should.have.properties('ip', 'time', 'url', 'method');
      return done();
    });

    setTimeout(function() {
      request('http://127.0.0.1:9007/slow', function(req, res) {});
    }, 100);
  });
});
