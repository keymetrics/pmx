

var pmx    = require('..');
var should = require('should');
var Plan   = require('./helpers/plan.js');

function forkAlertedModule() {
  var module_env = JSON.stringify({
    'probes' : {
      'probe-test' : {
        'value' : '10'
      }
    }
  });

  var app = require('child_process').fork(__dirname + '/fixtures/module/module.without.alert.js', [], {
    // This is what is send from PM2 to module
    env : {
      'module' : module_env
    }
  });
  return app;
}

function forkAlertedModuleWithAlertDeclared() {
  var module_env = JSON.stringify({
    'probes' : {
      'probe-test' : {
        'value' : '10'
      }
    }
  });

  var app = require('child_process').fork(__dirname + '/fixtures/module/module.fixture.js', [], {
    // This is what is send from PM2 to module
    env : {
      'module' : module_env
    }
  });
  return app;
}

function forkVariousProbesOverrided() {
  var module_env = JSON.stringify({
    'probes' : {
      'req/min' : {
        'value' : '10'
      },
      'Downloads' : {
        'value' : '10'
      },
      'delay' : {
        'value' : '10'
      }
    }
  });

  var app = require('child_process').fork(__dirname + '/fixtures/module/module.various.probes.js', [], {
    // This is what is send from PM2 to module
    env : {
      'module' : module_env
    }
  });
  return app;
}

describe('Alert system configuration', function() {
  var app;

  describe('Configured alert probe', function() {
    it('should start module with alert activated', function(done) {
      app = forkAlertedModule();

      app.once('message', function(dt) {
        dt.data.alert_enabled.should.be.true;
        done();
      });

    });

    it('should alert take alert configuration from environment', function(done) {
      var plan = new Plan(2, function() {
        app.kill();
        app.removeListener('message', processMsg);
        done();
      });

      function processMsg(dt) {
        if (dt.type == 'axm:monitor') {
          dt.data['probe-test'].alert.value.should.eql(10);
          dt.data['probe-test'].alert.mode.should.eql('threshold');
          dt.data['probe-test'].alert.cmp.should.eql('>');
          plan.ok(true);
        }

        if (dt.type == 'process:exception') {
          //should(dt.data.message).startWith('val too high');
          plan.ok(true);
        }
      }

      app.on('message', processMsg);
    });
  });

  describe('Override declared alert values', function() {
    it('should start module with alert activated', function(done) {
      app = forkAlertedModuleWithAlertDeclared();

      app.once('message', function(dt) {
        dt.data.alert_enabled.should.be.true;
        done();
      });
    });

    it('should alert take alert configuration from environment', function(done) {
      var plan = new Plan(2, function() {
        app.kill();
        app.removeListener('message', processMsg);
        done();
      });

      function processMsg(dt) {
        if (dt.type == 'axm:monitor') {
          dt.data['probe-test'].alert.value.should.eql(10);
          dt.data['probe-test'].alert.mode.should.eql('threshold');
          dt.data['probe-test'].alert.cmp.should.eql('>');
          plan.ok(true);
        }

        if (dt.type == 'process:exception') {
          //should(dt.data.message).startWith('val too high');
          plan.ok(true);
        }
      }

      app.on('message', processMsg);
    });
  });

  describe('Override various probes', function() {
    it('should start module', function(done) {
      app = forkVariousProbesOverrided();

      app.once('message', function(dt) {
        dt.data.alert_enabled.should.be.true;
        done();
      });
    });

    it('should alert take alert configuration from environment', function(done) {
      var plan = new Plan(4, function() {
        app.kill();
        app.removeListener('message', processMsg);
        done();
      });

      var delay = false;
      var downloads = false;
      var reqmin = false;

      function processMsg(dt) {
        if (dt.type == 'axm:monitor' && dt.data['delay'] && !delay) {
          delay = true;
          dt.data['delay'].alert.value.should.eql(10);
          dt.data['delay'].alert.mode.should.eql('threshold');
          dt.data['delay'].alert.cmp.should.eql('>');
          plan.ok(true);
        }

        if (dt.type == 'axm:monitor' && dt.data['Downloads'] && !downloads) {
          downloads = true;
          dt.data['Downloads'].alert.value.should.eql(10);
          dt.data['Downloads'].alert.mode.should.eql('threshold');
          dt.data['Downloads'].alert.cmp.should.eql('>');
          plan.ok(true);
        }

        if (dt.type == 'axm:monitor' && dt.data['req/min'] && !reqmin) {
          reqmin = true;
          dt.data['req/min'].alert.value.should.eql(10);
          dt.data['req/min'].alert.mode.should.eql('threshold');
          dt.data['req/min'].alert.cmp.should.eql('>');
          plan.ok(true);
        }

        if (dt.type == 'process:exception' ) {

          if (dt.data.message.indexOf('Probe Downloads has reached') > -1)
            plan.ok(true);
        }
      }

      app.on('message', processMsg);
    });

  });


});
