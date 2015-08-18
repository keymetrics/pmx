
var pmx = require('..');
var should = require('should');

function forkAlertedModule() {
  var app = require('child_process').fork(__dirname + '/fixtures/module/module.fixture.js', [], {
    env : {
    }
  });
  return app;
}

function forkNonAlertedModule() {
  var app = require('child_process').fork(__dirname + '/fixtures/module/module.alert-off.fixture.js', [], {
    env : {
    }
  });
  return app;
}

describe('Alert system', function() {
  var app;

  describe('With Alert', function() {
    it('should start module with alert activated', function(done) {
      app = forkAlertedModule();

      app.once('message', function(dt) {
        dt.data.alert_enabled.should.be.true;
        done();
      });

    });

    it('should receive notification threshold alert', function(done) {
      function processMsg(dt) {
        if (dt.type == 'process:exception') {
          should(dt.data.message).be.equal('val too high');
          app.removeListener('message', processMsg);
          app.kill();
          done();
        }
      }

      app.on('message', processMsg);
    });
  });

  describe('Without Alert', function() {
    it('should start module with alert activated', function(done) {
      app = forkNonAlertedModule();

      app.once('message', function(dt) {
        dt.data.alert_enabled.should.be.false;
        done();
      });

    });

    it('should receive notification threshold alert', function(done) {
      function processMsg(dt) {
        if (dt.type == 'process:exception') {
          done('ERROR EMITTED :/');
        }
      }

      console.log('Waiting 3secs (no alert should be emitted)');

      setTimeout(function() {
        app.removeListener('message', processMsg);
        app.kill();
        done();
      }, 3000);
      app.on('message', processMsg);
    });

  });




});
