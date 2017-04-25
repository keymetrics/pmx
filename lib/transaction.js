
var util            = require('util');
var Proxy           = require('./utils/proxy.js');
var SimpleHttpWrap  = require('./wrapper/simple_http.js');
var Options         = require('./configuration.js');
var debug           = require('debug')('axm:tracing');
var Transport       = require('./utils/transport.js');

var Transaction = module.exports = {};

Transaction.tracing = function (pmx, opts) {

  if (Array.isArray(opts.ignore_routes) && opts.ignore_routes.length > 0) {
    opts.ignoreFilter.url = opts.ignore_routes;
  }

  // we should never enable tracing agent two time
  if (require('vxx').get().isActive()) return;

  Transaction.tracer = require('vxx').start(opts);

  Options.configureModule({
    tracing_enabled : true
  });
  
  // broadcast to pm2 aggregator
  Transaction.tracer.getBus().on('transaction', function(data) {
    Transport.send({
      type: 'axm:trace',
      data: data
    })
  })

  // Transaction.tracer.getBus().on('transaction', function (data) {
  //   if (!opts.custom_probes) return;
  //   // TODO: mine tracing data and require custom probes
  //   /*try {
  //     var custom_probe = require('./probes/' + modul)(pmx, Transaction.tracer)
  //   } catch (err) { }*/
  // })
};

Transaction.http = function(opts) {
  var Module = require('module');

  debug('Wrapping HTTP routes');

  if (Array.isArray(opts)) {
    var routes = JSON.parse(JSON.stringify(opts));
    opts = {
      http          : true,
      http_latency  : 200,
      http_code     : 500,
      ignore_routes : routes
    };
  }
  opts = util._extend({
    http          : true,
    http_latency  : 200,
    http_code     : 500,
    ignore_routes : []
  }, opts);

  Proxy.wrap(Module, '_load', function(load) {
    if (load.__axm_original) {
      debug('HTTP routes have already been wrapped before');

      Options.configureModule({
        latency : opts.http
      });

      if (opts.http === false) {
        return function(file) { return load.__axm_original.apply(this, arguments) };
      } else {
        return function(file) {
          if (file === 'http' || file === 'https')
            return SimpleHttpWrap(opts, load.__axm_original.apply(this, arguments));
          else
            return load.__axm_original.apply(this, arguments);
        };
      }
    }

    return function(file) {
      if (opts.http &&
          (file === 'http' || file === 'https')) {
        debug('http module being required');
        Options.configureModule({
          latency : true
        });
        return SimpleHttpWrap(opts, load.apply(this, arguments));
      }
      else
        return load.apply(this, arguments);
    };
  });
};
