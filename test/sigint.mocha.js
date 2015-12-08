
var pmx = require('..');

function forkRaw() {
  return require('child_process').fork(__dirname + '/fixtures/sigint/raw-app.js', []);
}

function forkWithHandler() {
  return require('child_process').fork(__dirname + '/fixtures/sigint/sigint-handler.js', []);
}

function forkBeforeExit() {
  return require('child_process').fork(__dirname + '/fixtures/sigint/beforeExit.js', []);
}

describe('SIGINT handling', function() {

  it('should kill app via SIGINT', function(done) {
    var app = forkRaw();

    app.on('exit', function(code, signal) {
      done();
    });

    setTimeout(function() {
      app.kill('SIGINT');
    }, 500);
  });

  it('should fail to kill app via SIGINT because of handler', function(done) {
    var app = forkWithHandler();

    app.on('exit', function(code, signal) {
      if (signal == 'SIGTERM') return done();
      // Avoid shit with node 0.10.x
      if (code == 143) return done();
      done(new Error('should not enter here'));
    });

    setTimeout(function() {
      app.kill('SIGINT');

      setTimeout(function() {
        app.kill('SIGTERM');
      }, 1000);
    }, 500);
  });

  it('should test with beforeExit and get right code', function(done) {
    if (!(process.version.match(/^v(\d+\.\d+)/)[1].indexOf('0.10') == -1)) return done();

    var app = forkBeforeExit();

    app.on('exit', function(code, signal) {
      if (code == 42) return done();
      console.log(arguments);
      done(new Error('should not enter here'));
    });

    setTimeout(function() {
      app.kill('SIGINT');
    }, 500);
  });


});
