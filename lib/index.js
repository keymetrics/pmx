
var Events      = require('./events.js');
var Actions     = require('./actions.js');
var Notify      = require('./notify.js');
var Transaction = require('./transaction.js');
var Network     = require('./network.js');
var Monitor     = require('./monitor.js');

var Probe       = require('./Probe.js');

var Pm2Module   = require('./pm2_module.js');

var util        = require('util');

var Export      = {};

/**
 * Flatten API
 */
util._extend(Export, Events);
util._extend(Export, Actions);
util._extend(Export, Notify);
util._extend(Export, Monitor);
util._extend(Export, Pm2Module);
util._extend(Export, Probe);
util._extend(Export, Transaction);
util._extend(Export, Network);

Export.init = function(opts) {
  if (!opts) opts = {};

  opts = util._extend({
    http          : true,
    http_latency  : 200,
    http_code     : 500,
    ignore_routes : [],
    errors        : true,
    custom_probes : true
  }, opts);

  Export.catchPorts();
  Export.http(opts);
  Export.catchAll(opts);
  if (opts.custom_probes) {
    // Event loop monitoring
    require('./probes/pacemaker.js')(Export);
  }
  return this;
};

/**
 * Export
 */

module.exports = Export;
