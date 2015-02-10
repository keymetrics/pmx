
var pmx = require('..');

function fork() {
  var app = require('child_process').fork(__dirname + '/fixtures/module/module.fixture.js', []);
  return app;
}

describe('PMX module', function() {
  var app;
  var action_name;

  it('should emit a new action', function(done) {
    // 1 - It should emit an action
    app = fork();

    app.once('message', function(dt) {
      dt.type.should.eql('axm:option:configuration');
      dt.data.show_module_meta.should.exists;
      dt.data.description.should.eql('comment');
      dt.data.module_version.should.eql('1.0.0');
      dt.data.module_name.should.eql('module');
      done();
    });
  });

});
