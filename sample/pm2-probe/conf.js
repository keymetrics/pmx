
var pmx     = require('pmx');
var fs      = require('fs');
var path    = require('path');

module.exports = {
  internals : {
    comment          : 'This module monitors PM2',
    errors           : true,
    latency          : false,
    versioning       : false,
    show_module_meta : false,
    module_type      : 'database',
    pid              : pmx.getPID(path.join(process.env.HOME, '.pm2', 'pm2.pid'))
  },

  pool_time  : 1000,
  active_pro : true
};
