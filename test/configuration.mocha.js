
var Configuration = require('../lib/Configuration');
var should = require('should');

describe('Configuration', function() {
  // Simulate passing configuration data via PM2
  process.env['outside-pm2'] = '{ "option1" : true }';

  it('should initConf for app', function() {
    var conf = Configuration.initConf({
      __is_module : false
    });

    should(conf).have.properties([
      'module_conf',
      'module_name',
      'module_version',
      'pmx_version'
    ]);

    should(conf.module_conf.option1).be.eql(true);
  });

  it('should initConf for module', function() {
    var conf = Configuration.initConf({
      __is_module : true
    });

    should(conf).have.properties([
      'module_conf',
      'module_name',
      'module_version',
      'pmx_version'
    ]);
  });

  it('should find existing file', function() {
    var content = Configuration.resolvePidPaths([
      'asdasdsad',
      'asdasd',
      'lolilol',
      __dirname + '/fixtures/file.pid'
    ]);

    content.should.eql(1456);
  });

  it('should return null', function() {
    var content = Configuration.resolvePidPaths([
      'asdasdsad',
      'asdasd',
      'lolilol'
    ]);

    should(content).be.null();
  });

  it('should get pid', function() {
    var pid = Configuration.getPID(__dirname + '/fixtures/file.pid');
    pid.should.eql(1456);
  });


});
