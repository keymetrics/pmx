
var util        = require('util');
var kmTrace     = require('km-trace');
var debug       = require('debug')('axm:tracing');
var Transport   = require('./utils/transport.js');

var Transaction = module.exports = {};

Transaction.tracer = kmTrace.monitor();

Transaction.tracing = function(pmx, opts) {
  var traced_modules = ['express', 'http', 'axon', 'leveldown', 'loopback', 'memcached', 'mongo', 'mqlight',
                    'basho-riak-client', 'mqlight', 'mysql', 'oracle', 'oracledb', 'postgres', 'redis', 'socketio',
                    'strong-express-metrics', 'strong-mq', 'strong-oracle'];

  // delete blacklisted modules transactions
  if (typeof(opts.blacklist_mdls) === 'array') {
    traced_modules.forEach(function (modul, idx) {
      if (blacklist_mdls.indexOf(modul) > -1)
        delete traced_modules[idx];
    })
  }
  
  // enable transactions modules      
  if (opts.transactions) {
    traced_modules.forEach(function (modul, idx) {
      kmTrace.enable(modul);
      // try requiring custom probes for this module
      try {
        var custom_probe = require('./probes/' + modul)(pmx, Transaction.tracer)
      } catch (err) {} 
    })
  }
  
  // enable tracing
  if (opts.tracing) {
    kmTrace.enable('trace');
    kmTrace.enable('requests');
  }

  Transaction.tracer.on('request', function (data) {
    Transport.send({
      type: 'transaction:request',
      data: data
    })
  })
  
  // broadcast module events in pm2 bus via ipc
  traced_modules.forEach(function (modul) {
    Transaction.tracer.on(modul, function (data) {
      Transport.send({ type: 'transaction:' + modul, data: data })
    })
  });
};