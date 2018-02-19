
var axm = require('..');
var should = require('should');

function fork(script) {
  var app = require('child_process').fork(__dirname + (script || '/fixtures/probe.mocha/probe.fixture.js'), []);
  return app;
}

function forkHistogram() {
  var app = require('child_process').fork(__dirname + '/fixtures/probe.mocha/histogram.fixture.js', []);
  return app;

}

function forkMetric() {
  return require('child_process').fork(__dirname + '/fixtures/probe.mocha/metric.fixture.js', []);
}

function forkNonUserProbes() {
  return require('child_process').fork(__dirname + '/fixtures/probe.mocha/never_called.fixture.js', []);
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

  it('should instanciate metric sample app', function(done) {
    var app = forkMetric();

    app.on('message', function(pck) {
      // Will iterate two times, metric change the value to false
      should(pck.data['Realtime user'].value).eql(2);
      should(pck.data['Realtime user'].unit).eql('kb');
      should(pck.data['Realtime user'].historic).eql(false);
      should(pck.data['Realtime user'].type).eql('v8/smthing');
      app.kill()
      done()
    })
  });

  // Metric is the only value that can be detected
  // as a non used metrics
  it.skip('should not retrieve non used metrics', function(done) {
    var app = forkNonUserProbes()

    app.on('message', function(pck) {
      console.log(pck)
      //app.kill()
    })
  });


  it('should fork app and receive data from probes', function(done) {
    var app = fork();

    app.on('message', function(pck) {
      // Will iterate two times, metric change the value to false
      pck.type.should.eql('axm:monitor');

      pck.data.should.have.properties('req/min',
                                      'Realtime user',
                                      'random',
                                      'Cheerio');

      should(pck.data['Realtime user'].historic).eql(true);
      should(pck.data['random'].historic).eql(true);
      should(pck.data['Cheerio'].historic).eql(true);
      should(pck.data['req/min'].historic).eql(true);
      should(pck.data['Realtime user'].type).eql('Realtime user');
      should(pck.data['random'].type).eql('random');
      should(pck.data['req/min'].type).eql('req/min');

      if (pck.data.random.value           && pck.data.random.agg_type == 'sum' &&
          pck.data.Cheerio.value.yes == true && pck.data.Cheerio.agg_type == 'avg' &&
          pck.data.Downloads.value > 1    && pck.data.Downloads.agg_type == 'max') {
        app.kill();
        done();
      }
    });
  });

  it('should receive transposed data', function(done) {
    var app = fork('/fixtures/transpose.fixture.js');
    var pass = 0;

    app.on('message', function(pck) {
      // Will iterate two times, metric change the value to false
      pck.type.should.eql('axm:monitor');

      pck.data.should.have.properties('style_2_docker_config',
                                      'style_1_docker_config');
      if (pck.data.style_1_docker_config.value.val == 'new value' &&
          pck.data.style_2_docker_config.value.val == 'new value') {
        app.kill();
        done();
      }
    });
  });

  it('should fork app and receive data', function(done) {
    var app = forkHistogram();

    app.on('message', function(pck) {
      should(pck.data['min'].historic).eql(true);

      if (pck.data.mean && pck.data.mean.agg_type == 'avg' &&
          pck.data.min  && pck.data.min.agg_type == 'min' &&
          pck.data.test && pck.data.test.agg_type == 'sum') {
        app.kill();
        done();
      }
    });
  });


})
