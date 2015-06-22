
var pmx = require('..');
var should = require('should');

function fork() {
  var app = require('child_process').fork(__dirname + '/fixtures/module/module.fixture.js', [], {
    env : {
      'module' : '{ "option1" : "value1", "option2" : "value2" }'
    }
  });
  return app;
}

describe('PMX module', function() {
  var app;
  var action_name;

  it('should emit a new action', function(done) {
    // 1 - It should emit an action
    app = fork();

    app.once('message', function(dt) {

      /**
       * Right event sent
       */
      dt.type.should.eql('axm:option:configuration');

      /**
       * Options set
       */
      dt.data.show_module_meta.should.exists;
      dt.data.description.should.eql('comment');
      dt.data.module_version.should.eql('1.0.0');
      dt.data.module_name.should.eql('module');

      /**
       * Configuration succesfully passed
       */
      dt.data.option1.should.eql('value1');
      dt.data.option2.should.eql('value2');
      done();
    });
  });

  it('should find existing file', function(done) {
    var content = pmx.resolvePidPaths([
      'asdasdsad',
      'asdasd',
      'lolilol',
      __dirname + '/fixtures/file.pid'
    ]);

    content.should.eql(1456);
    done();
  });

  it('should return null', function(done) {
    var content = pmx.resolvePidPaths([
      'asdasdsad',
      'asdasd',
      'lolilol'
    ]);

    should(content).be.null;
    done();
  });

});
