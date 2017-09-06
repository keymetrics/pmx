
var util = require('util');

var Events = require('./Events.js');
var Actions = require('./Actions.js');
var ErrorManagement = require('./ErrorManagement.js');
var Transaction = require('./transaction.js');
var Profiling = require('./Profiling.js');
var Probe = require('./Probe.js');
var Wrapper = require('./Wrapper.js');
var Configuration = require('./Configuration.js');

var PMX      = {};

/////////////////////////////////
// Bind Modules methods to PMX //
/////////////////////////////////

// .emit
util._extend(PMX, Events);

// .action
// .scopedAction
util._extend(PMX, Actions);

// .catchAll
// .notify <-> .reportError
// .expressErrorHandler
util._extend(PMX, ErrorManagement);

// .configureModule
// .initConf
// .getPID
// .resolvePidPaths
util._extend(PMX, Configuration);

// .probe <-> .Probe
util._extend(PMX, Probe);

// .exposeProfiling
// .detectV8Profiler
// .v8Profiling
util._extend(PMX, Profiling);

// .tracing
util._extend(PMX, Transaction);

// Grab defaut configuration
PMX._pmx_conf = Configuration.initConf({}, true);

PMX.init = function(opts) {
  if (!opts) opts = {};

  opts = util._extend({
    __is_module   : false,

    profiling     : true,
    alert_enabled : true,
    custom_probes : true,

    // Wrapper
    http          : true,
    http_latency  : 200,
    http_code     : 500,
    ignore_routes : [],

    network       : false,
    ports         : false,
    errors        : true,
    error_wrapper : true,

    new_port      : false,
    // VXX options
    transactions  : false,
    // ignoreFilter.url is aliased to ignore_routes
    ignoreFilter: {
      'url': [],
      'method': ['OPTIONS']
    },
    // 'express', 'hapi', 'http', 'restify'
    excludedHooks: []
  }, opts);

  opts = Configuration.initConf(opts);

  this._pmx_conf = opts;

  // opts.http
  // opts.error_wrapper
  // opts.ports
  // opts.network
  Wrapper.enable(opts);

  PMX.catchAll(opts);

  if (opts.transactions)
    PMX.tracing(PMX, opts);

  if (opts.profiling)
    Profiling.v8Profiling(PMX);

  if (opts.custom_probes == true) {
    // Event loop monitoring
    require('./default_probes/pacemaker.js')(PMX);
    require('./default_probes/node_insights.js')(PMX);
  }

  return this;
};

PMX.initModule = function(opts, cb) {
  if (!opts) opts = {};

  opts = util._extend({
    alert_enabled    : true,
    __is_module      : true,
    widget           : {}
  }, opts);

  opts.widget = util._extend({
    type : 'generic',
    logo : 'https://app.keymetrics.io/img/logo/keymetrics-300.png',
    theme: ['#111111', '#1B2228', '#807C7C', '#807C7C']
  }, opts.widget);

  opts = Configuration.initConf(opts);

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
