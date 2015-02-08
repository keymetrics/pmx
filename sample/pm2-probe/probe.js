var pmx     = require('../..');
var fs      = require('fs');
var path    = require('path');
var shelljs = require('shelljs');

// + merge package.json data

var conf = pmx.loadConfig();

setInterval(function() {
  // Do something at configurable interval
}, conf.pool_time);


pmx.action('flush logs', { comment : 'Flush logs' } , function(reply) {
  var child = shelljs.exec('pm2 flush');
  return reply(child);
});

var Probe = pmx.probe();
