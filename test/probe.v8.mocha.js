var exec = require('child_process').exec;

var GC_MODULE = 'gc-stats';

function fork(script) {
  var app = require('child_process').fork(__dirname + (script || '/fixtures/probe.v8.fixture.js'), []);
  return app;
}

function forkNoV8(script) {
  var app = require('child_process').fork(__dirname + (script || '/fixtures/probe.v8disabled.fixture.js'), []);
  return app;
}

describe('Probe V8', function () {
  it('should fork app and doest\'t receive data from v8 probes (v8 disabled)', function (done) {
    var app = forkNoV8();

    app.on('message', function (pck) {
      if (pck.type === 'axm:monitor') {
        pck.data.should.have.not.property('New space used size');
        pck.data.should.have.not.property('Old space used size');
        pck.data.should.have.not.property('Map space used size');
        pck.data.should.have.not.property('Code space used size');
        pck.data.should.have.not.property('Large object space used size');

        pck.data.should.have.not.property('Heap size');
        pck.data.should.have.not.property('Heap size executable');
        pck.data.should.have.not.property('Used heap size');
        pck.data.should.have.not.property('Heap size limit');

        app.kill();
        done();
      }
    });
  });

  it('should fork app and receive data from v8 probes', function (done) {
    var app = fork();

    app.on('message', function (pck) {
      if (pck.type === 'axm:monitor') {
        pck.data.should.have.property('New space used size');
        pck.data.should.have.property('Old space used size');
        pck.data.should.have.property('Map space used size');
        pck.data.should.have.property('Code space used size');
        pck.data.should.have.property('Large object space used size');

        pck.data.should.have.property('Heap size');
        pck.data.should.have.property('Heap size executable');
        pck.data.should.have.property('Used heap size');
        pck.data.should.have.property('Heap size limit');

        Number.isInteger(pck.data['New space used size'].value).should.be.true();
        Number.isInteger(pck.data['Old space used size'].value).should.be.true();
        Number.isInteger(pck.data['Map space used size'].value).should.be.true();
        Number.isInteger(pck.data['Code space used size'].value).should.be.true();
        Number.isInteger(pck.data['Large object space used size'].value).should.be.true();

        Number.isInteger(pck.data['Heap size'].value).should.be.true();
        Number.isInteger(pck.data['Heap size executable'].value).should.be.true();
        Number.isInteger(pck.data['Used heap size'].value).should.be.true();
        Number.isInteger(pck.data['Heap size limit'].value).should.be.true();

        app.kill();
        done();
      }
    });
  });
});

xdescribe('Probe V8 GC', function () {
  after(function (done) {
    exec('npm uninstall ' + GC_MODULE, done);
  });

  before(function (done) {
    exec('npm install ' + GC_MODULE, function (err) {
      should(err).be.null();
      setTimeout(done, 1000);
    });
  });

  it('should fork app and receive data from v8 gc', function (done) {
    var app = fork();

    app.on('message', function (pck) {
      if (pck.type === 'axm:monitor' && pck.data.hasOwnProperty('Heap size')) {
        pck.data.should.have.property('GC Heap size');
        pck.data.should.have.property('GC Used heap size');
        pck.data.should.have.property('GC Executable heap size');
        pck.data.should.have.property('GC Type');
        pck.data.should.have.property('GC Pause');

        Number.isInteger(pck.data['GC Heap size'].value).should.be.true();
        Number.isInteger(pck.data['GC Used heap size'].value).should.be.true();
        Number.isInteger(pck.data['GC Executable heap size'].value).should.be.true();
        Number.isInteger(pck.data['GC Pause'].value).should.be.true();
        Number.isInteger(pck.data['GC Type'].value).should.be.true();

        app.kill();
        done();
      }
    });
  });
});
