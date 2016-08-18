
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
    var plan = new Plan(2, function() {
      app.removeListener('message', processMsg);
      done();
    });

    app = forkApp();

    function processMsg(dt) {
      if (dt.type == 'axm:action' && dt.action_name == 'getEnv') {
        plan.ok(true);
      }

      if (dt.type == 'axm:monitor' &&
          dt.data['Loop delay'] &&
          dt.data['Modules']) {
        plan.ok(true);
      }
    }

    app.on('message', processMsg);
  });
});
