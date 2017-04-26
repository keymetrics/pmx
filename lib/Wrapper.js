
var util = require('util');
var debug = require('debug')('axm:tracing');

var HttpWrapper = require('./wrapper/http_wrapper.js');
var ErrorWrapper = require('./wrapper/error_wrapper.js');
var NetWrapper = require('./wrapper/net_wrapper.js');
var Proxy = require('./utils/proxy.js');

var Wrapper = module.exports = {};

Wrapper.internalObject = function(opts) {
  // if (opts.error_wrapper === true)
  //   ErrorWrapper(opts);
  if (opts.ports === true)
    NetWrapper.catchPorts();
  if (opts.network === true)
    NetWrapper.catchTraffic();
}

Wrapper.requireProxy = function(opts) {
  var Module = require('module');

  Proxy.wrap(Module, '_load', function(load) {
    return function(file) {
      if (opts.http && (file === 'http' || file === 'https')) {
        return HttpWrapper(opts, load.apply(this, arguments));
      }
      // else if (file === 'stream') {
      //   return StreamWrapper(load.apply(this, arguments));
      // }
      else
        return load.apply(this, arguments);
    };
  });
}

Wrapper.enable = function(opts) {
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

  Wrapper.requireProxy(opts);
  Wrapper.internalObject(opts);
};
