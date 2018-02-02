
var pmx       = require('..');
var Inspector = require('../lib/probes/event-loop-inspector.js');
var utils     = require('../lib/utils/module.js');
var should    = require('should');
var exec      = require('child_process').exec;
var path      = require('path');

function fork () {
  return require('child_process').fork(path.join(__dirname, '/fixtures/module/module.async.require.js'), []);
}

function forkDumpableApp () {
  var app = require('child_process').fork(path.join(__dirname, '/fixtures/http.js'), []);
  return app;
}

var MODULE = 'event-loop-inspector';

describe('Event loop inspector module', function () {
  this.timeout(50000);

  before(function (done) {
    exec('npm uninstall ' + MODULE, done);
  });

  after(function (done) {
    exec('npm uninstall ' + MODULE, done);
  });

  describe('Basic tests', function () {
    it('should have right properties', function (done) {
      pmx.should.have.property('eventLoopDump');
      Inspector.should.have.property('exposeActions');
      Inspector.should.have.property('eventLoopDump');
      done();
    });

    it('should not break "require" if ' + MODULE + ' is not present', function (done) {
      fork().on('exit', function (n) {
        if (n) {
          done(new Error('Process exited with a non-zero code'));
        } else {
          done();
        }
      });
    });

    it('should return error as ' + MODULE + ' not present', function (done) {
      utils.detectModule(MODULE, function (err, data) {
        should(err).not.be.null();
        should(data).be.undefined();
        done();
      });
    });
  });

  describe('Event loop inspector module', function () {
    before(function (done) {
      exec('npm install ' + MODULE, function (err) {
        should(err).be.null();
        setTimeout(done, 1000);
      });
    });

    it('should detect event-loop-inspector', function (done) {
      utils.detectModule(MODULE, function (err, data) {
        should(err).be.null();
        done();
      });
    });
  });

  describe('Event loop dump', function () {
    var app;

    after(function () {
      process.kill(app.pid);
    });

    it('should start an application with inspector detected', function (done) {
      app = forkDumpableApp();
      setTimeout(done, 2000);
    });

    it('should trigger dump', function (done) {
      var t;

      function incomingMsg (dt) {
        if (dt.type !== 'axm:reply') { return false; };
        clearTimeout(t);
        dt.type.should.eql('axm:reply');
        dt.data.return.success.should.eql(true);
        dt.data.return.should.property('dump');
        dt.data.return.dump.should.property('handles');
        app.removeListener('message', incomingMsg);
        done();
      }

      app.on('message', incomingMsg);

      app.send('km:event-loop-dump');

      t = setTimeout(function () {
        done(new Error('havent got any dump'));
      }, 10000);
    });
  });
});
