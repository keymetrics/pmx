
var pmx = require('..');

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
    pmx.init();
  });

  it('should init MODULE pmx', function() {
    pmx.initModule();
  });
});
