
var pmx = require('..');

function forkRaw() {
  return require('child_process').fork(__dirname + '/fixtures/sigint/raw-app.js', []);
}

function forkWithHandler() {
  return require('child_process').fork(__dirname + '/fixtures/sigint/sigint-handler.js', []);
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
      done(new Error('should not enter here'));
    });

    setTimeout(function() {
      app.kill('SIGINT');

      setTimeout(function() {
        app.kill('SIGTERM');
      }, 1000);
    }, 500);
  });


});
