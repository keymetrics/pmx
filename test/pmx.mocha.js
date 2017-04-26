
var should = require('should');
var pmx = require('..');
var assert = require('assert');

describe('PMX driver', function() {
  it('should have the right properties', function() {
    pmx.should.have.properties([
      'emit',
      'action',
      'scopedAction',
      'catchAll',
      'reportError',
      'notify',
      'getPID',
      'initConf',
      'resolvePidPaths',
      'probe',
      'Probe',
      'exposeProfiling',
      'detectV8Profiler',
      'v8Profiling',
      'tracing'
    ]);
  });

  it('should init APP pmx', function() {
    var ret = pmx.init();
    should.exists(ret._pmx_conf);
    assert(ret._pmx_conf.__is_module == false);
  });

  it('should init MODULE pmx', function() {
    pmx.initModule();
  });
});
