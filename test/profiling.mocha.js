
var pmx       = require('..');
var Profiling = require('../lib/probes/profiling.js');
var should = require('should');
var shelljs = require('shelljs');
var pm2 = require('pm2');

function fork() {
  return require('child_process').fork(__dirname + '/fixtures/module/module.async.require.js', []);
}

function forkDumpableApp() {
  var app = require('child_process').fork(__dirname + '/fixtures/http.js', []);
  return app;
}


var PROFILER_MODULE = 'v8-profiler-node8';

describe('Profiling', function() {
  this.timeout(50000);

  before(function(done) {
    shelljs.exec('npm uninstall ' + PROFILER_MODULE, done);
  });

  after(function(done) {
    shelljs.exec('npm uninstall ' + PROFILER_MODULE, done);
  });

  describe('Basic tests', function() {
    it('should have right properties', function(done) {
      pmx.should.have.property('v8Profiling');
      Profiling.should.have.property('detectV8Profiler');
      Profiling.should.have.property('exposeProfiling');
      Profiling.should.have.property('v8Profiling');
      done();
    });

    it('should not break "require" if v8-profiler is not present', function(done) {
      fork().on('exit', function(n) {
        if (n) {
          done(new Error("Process exited with a non-zero code"));
        } else {
          done();
        }
      });
    });

    it('should return error as v8-profiler not present', function(done) {
      Profiling.detectV8Profiler(PROFILER_MODULE, function(err, data) {
        should(err).not.be.null();
        should(data).be.undefined();
        done();
      });
    });
  });

  describe('V8-profiler', function() {
    before(function(done) {
      shelljs.exec('npm install ' + PROFILER_MODULE, function(code) {
        should(code).eql(0);
        setTimeout(done, 1000);
      });
    });

    it('should detect v8 profiler', function(done) {
      Profiling.detectV8Profiler(PROFILER_MODULE, function(err, data) {
        should(err).be.null();
        done();
      });
    });
  });

  describe('Memory profiling - Real life conditions profiling', function() {
    var app;

    after(function() {
      process.kill(app.pid);
    });

    it('should start an application with profiling detected', function(done) {
      app = forkDumpableApp()
      setTimeout(done, 2000);
    });

    it('should trigger memory heapdump', function(done) {
      var t;

      function incomingMsg(dt) {
        if (dt.type != 'axm:reply') return false;
        clearTimeout(t);
        dt.type.should.eql('axm:reply');
        app.removeListener('message', incomingMsg);
        done();
      }

      app.on('message', incomingMsg);

      app.send('km:heapdump');

      t = setTimeout(function() {
        done(new Error('havent got any heapdump'));
      }, 10000);
    });

    it('should start cpu profiling', function(done) {
      var t;

      function incomingMsg(dt) {
        if (dt.type != 'axm:reply') return false;
        clearTimeout(t);
        dt.type.should.eql('axm:reply');
        console.log(dt.data);
        app.removeListener('message', incomingMsg);
        done();
      }

      app.on('message', incomingMsg);

      app.send('km:cpu:profiling:start');

      t = setTimeout(function() {
        done(new Error('could not start CPU profiling'));
      }, 10000);
    });

    it('should stop cpu profiling', function(done) {
      var t;

      function incomingMsg(dt) {
        if (dt.type != 'axm:reply') return false;
        clearTimeout(t);
        dt.type.should.eql('axm:reply');
        should.exist(dt.data.return.dump_file);
        app.removeListener('message', incomingMsg);
        done();
      }

      app.on('message', incomingMsg);

      app.send('km:cpu:profiling:stop');

      t = setTimeout(function() {
        done(new Error('could not retrieve CPU profiling file'));
      }, 10000);
    });

  });
});
