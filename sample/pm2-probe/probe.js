var pmx     = require('pmx');
var fs      = require('fs');
var path    = require('path');
var shelljs = require('shelljs');

var conf = pmx.loadConfig();

pmx.action('flush pm2 logs', { comment : 'Flush logs' } , function(reply) {
  var child = shelljs.exec('pm2 flush');
  return reply(child);
});

pmx.action('df', { comment : 'Flush logs' } , function(reply) {
  var child = shelljs.exec('df');
  return reply(child);
});

var Probe = pmx.probe();
