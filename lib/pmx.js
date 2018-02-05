
var Events      = require('./events.js');
var Actions     = require('./actions.js');
var Notify      = require('./notify.js');
var Transaction = require('./transaction.js');
var Network     = require('./network.js');
var Monitor     = require('./monitor.js');
var Profiling   = require('./probes/profiling.js');
var Inspector   = require('./probes/event-loop-inspector.js');
var Probe       = require('./Probe.js');
var Dependencies = require('./dependencies.js');
var DeepMetrics = require('./probes/deep_metrics')

var Configuration   = require('./configuration.js');

var util        = require('util');

var PMX      = {};

/**
 * Flatten API
 */
util._extend(PMX, Events);
util._extend(PMX, Actions);
util._extend(PMX, Notify);
util._extend(PMX, Monitor);
util._extend(PMX, Configuration);
util._extend(PMX, Probe);
util._extend(PMX, Network);
util._extend(PMX, Profiling);
util._extend(PMX, Inspector);
util._extend(PMX, Transaction);
util._extend(PMX, DeepMetrics)

// Grab defaut configuration
PMX._pmx_conf = Configuration.init({}, true);

PMX.init = function(opts) {
  if (!opts) opts = {};

  opts = util._extend({
    default_actions : true,
    transactions  : false,
    http          : true,
    http_latency  : 200,
    http_code     : 500,
    ignore_routes : [],
    profiling     : true,
    errors        : true,
    // By default if you add alert subfield in custom
    // it's going to be enabled
    alert_enabled : true,
    custom_probes : true,
    network       : false,
    ports         : false,

    // VXX options
    // ignoreFilter.url is aliased to ignore_routes
    ignoreFilter: {
      'url': [],
      'method': ['OPTIONS']
    },
    // 'express', 'hapi', 'http', 'restify'
    excludedHooks: []
  }, opts);

  opts = Configuration.init(opts);
  this._pmx_conf = opts;

  if (opts.ports)
    PMX.catchPorts();
  if (opts.network)
    PMX.catchTraffic();

  if (opts.transactions)
    PMX.tracing(PMX, opts);
  if (opts.http)
    PMX.http(opts);

  // WIP
  var __td = setTimeout(function() {
    Dependencies.collect();
  }, 2000);

  __td.unref();

  PMX.catchAll(opts);

  if (opts.profiling) {
    Profiling.v8Profiling(PMX);
  }

  if (opts.event_loop_dump) {
    Inspector.eventLoopDump(PMX);
  }

  if (opts.v8) {
    require('./probes/v8.js')(PMX);
  }

  if (opts.custom_probes === true) {
    // Event loop monitoring
    require('./probes/loop_delay.js')(PMX)
    require('./probes/handles_requests.js')(PMX)
  }

  if (opts.deep_metrics === true) {
    // deep metrics
    DeepMetrics.enable(PMX)
  }

  if (opts.default_actions == true) {
    //require('./actions/default.js')(PMX);
  }

  opts.isModule = false;
  return this;
};

PMX.initModule = function(opts, cb) {
  if (!opts) opts = {};

  opts = util._extend({
    alert_enabled    : true,
    widget           : {}
  }, opts);

  opts.widget = util._extend({
    type : 'generic',
    logo : 'https://app.keymetrics.io/img/logo/keymetrics-300.png',
    theme            : ['#111111', '#1B2228', '#807C7C', '#807C7C']
  }, opts.widget);

  opts.isModule = true;
  opts = Configuration.init(opts);

  // Force error catching
  PMX.catchAll();

  this._pmx_conf = opts;

  if (cb && typeof(cb) == 'function')
    return cb(null, opts);

  return opts;
};

PMX.getConf = function() {
  return this._pmx_conf;
};

PMX.getEnv = function() {
  return process.env;
};

/**
 * Export
 */
module.exports = PMX;
