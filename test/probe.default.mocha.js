
var axm = require('..');

function fork(script) {
    var app = require('child_process').fork(__dirname + (script || '/fixtures/probe.default.fixture.js'), []);
    return app;
}


describe('Probe', function() {
    it('should have the right properties', function(done) {
        axm.should.have.property('probe');

        var probe = axm.probe();

        probe.should.have.property('meter');
        probe.should.have.property('metric');
        probe.should.have.property('histogram');
        probe.should.have.property('counter');
        done();
    });

    it('should fork app and receive data from probes', function(done) {
        var app = fork();

        app.on('message', function(pck) {

          if(pck.type === 'axm:monitor') {
              pck.data.should.have.property('Loop delay');
              pck.data.should.have.property('Active requests');
              pck.data.should.have.property('Active handles');
              app.kill();
              done();
          }

        });
    });

})
