
var shimmer = require('shimmer');
var Transport = require('../utils/transport.js');
var Configuration = require('../Configuration.js');

var gl_meter, gl_latency;

var HttpWrap = module.exports = function(opts, http) {
  var Probe = require('../..').probe();

  // Send flag to PM2 to notify about HTTP wrapping activation
  Configuration.configureModule({
    latency : true
  });

  gl_meter = Probe.meter({
    name    : 'HTTP',
    samples : 60,
    unit    : 'req/min'
  });

  gl_latency = Probe.histogram({
    measurement : 'mean',
    name        : 'pmx:http:latency',
    unit        : 'ms'
  });

  var ignoreRoutes = function(url) {
    for (var i = 0; i < opts.ignore_routes.length; ++i) {
      if (url.match(opts.ignore_routes[i]) != null) {
        return true;
      }
    }
    return false;
  };

  shimmer.massWrap(http.Server.prototype, ['on', 'addListener'], function(original) {
    return function(event, listener) {
      var self = this;

      var overloaded_function = function(request, response) {
        gl_meter.mark();

        var current_request = {
          start : Date.now(),
          url : request.url
        }

        response.once('finish', function() {
          if (!ignoreRoutes(current_request.url))
            gl_latency.update(Date.now() - current_request.start);
          current_request = null;
        });
      };

      if (!(event === 'request' && typeof listener === 'function'))
        return original.apply(self, arguments);

      if (self.__overloaded !== true) {

        self.on('removeListener', function onRemoveListener() {
          setTimeout(function() {
            if (self.listeners('request').length === 1) {
              self.removeListener('request', overloaded_function);
              self.removeListener('removeListener', onRemoveListener);
              self.__overloaded = false;
            }
          }, 200);
        });

        original.call(self, event, overloaded_function);

        self.__overloaded = true;
      }

      return original.apply(self, arguments);
    };
  });
  return http;
};
