
var pmx       = require('..');
var Profiling = require('../lib/Profiling.js');
var should = require('should');
var shelljs = require('shelljs');

function fork() {
  return require('child_process').fork(__dirname + '/fixtures/module/module.async.require.js', []);
}

describe('Profiling', function() {
  it('should have right properties', function(done) {
    pmx.should.have.property('v8Profiling');
    Profiling.should.have.property('detectV8Profiler');
    Profiling.should.have.property('exposeProfiling');
    Profiling.should.have.property('v8Profiling');
    done();
  });

  it("should not break 'require' if v8-profiler is not present", function(done) {
    fork().on('exit', function(n) {
        if (n) {
            done(new Error("Process exited with a non-zero code"));
        } else {
            done();
        }
    });
  });

  it.skip('should return error as v8-profiler not present', function(done) {
    Profiling.detectV8Profiler(function(err, data) {
      err.should.not.be.null;
      should(data).be.undefined;
      done();
    });
  });

  describe.skip('V8-profiler', function() {
    before(function(done) {
      shelljs.exec('npm install v8-profiler', function() {
        setTimeout(done, 10000);
      });
    });

    after(function(done) {
      shelljs.exec('npm uninstall v8-profiler', function() {
        done();
      });
    });

    it('should detect v8 profiler', function(done) {
      Profiling.detectV8Profiler(function(err, data) {
        console.log(arguments);
        err.should.not.be.null;
        should(data).be.undefined;
        done();
      });
    });
  });

});
