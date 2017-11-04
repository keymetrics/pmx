


var pmx    = require('..');
var should = require('should');
var Plan   = require('./helpers/plan.js');

function forkSampleApp() {
  var app = require('child_process').fork(__dirname + '/fixtures/sample-app/http.js');
  return app;
}

describe('Dependencies check return', function() {
  var app;

  this.timeout(5000);

  after(function(done) {
    app.kill();
    done();
  });

  it('should start app and receive dependencies list', function(done) {
    app = forkSampleApp();

    function processMsg(dt) {
      if (dt.type != 'application:dependencies')
        return false;

      should.exists(dt.data.debug);
      app.removeListener('message', processMsg);
      done()
    }

    app.on('message', processMsg);
  });
});
