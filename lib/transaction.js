
var util            = require('util');
var Configuration   = require('./Configuration.js');
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

  Configuration.configureModule({
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
