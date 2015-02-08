
var pmx     = require('../..');
var fs      = require('fs');
var path    = require('path');

module.exports = {
  internals : {
    name             : 'pm2 probe',
    comment          : 'This module monitors PM2',
    errors           : false,
    latency          : false,
    versioning       : false,
    show_module_meta : true,
    module_type      : 'database',
    pid              : pmx.getPID(path.join(process.env.HOME, '.pm2', 'pm2.pid'))
  },

  pool_time  : 1000,
  active_pro : true
};
