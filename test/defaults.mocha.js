
var pmx = require('..');
var Plan = require('./helpers/plan.js');

function forkApp(script) {
  var app = require('child_process').fork(__dirname + '/fixtures' + (script || '/init.js'), []);
  return app;
}

describe('Default Metrics and Actions', function() {
  var app;

  after(function() {
    process.kill(app.pid);
  });

  it('should fork app', function(done) {
    app = forkApp();

    function processMsg(dt) {
      if (dt.type == 'axm:option:configuration')  {
        app.removeListener('message', processMsg);
        done();
      }
    }

    app.on('message', processMsg);
  });
});
