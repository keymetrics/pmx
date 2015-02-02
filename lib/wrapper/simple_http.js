
var Proxy     = require('../utils/proxy.js');
var Transport = require('../utils/transport.js');

var HttpWrap = module.exports = function(http) {

  Proxy.wrap(http.Server.prototype, ['on', 'addListener'], function(addListener) {
    return function(event, listener) {

      if (!(event === 'request' && typeof listener === 'function')) return addListener.apply(this, arguments);

      return addListener.call(this, event, function(request, response) {
        var self = this;
        var args = arguments;

        var http_start = {
          url    : request.url,
          method : request.method,
          start  : Date.now(),
          ip     : request.headers['x-forwarded-for'] ||
            request.connection.remoteAddress ||
            request.socket.remoteAddress ||
            request.connection.socket.remoteAddress
        };

        response.once('finish', function() {

          Transport.send({
            type : 'http:transaction',
            data : {
              url        : http_start.url,
              method     : http_start.method,
              time       : Date.now() - http_start.start,
              code       : response.statusCode,
              ip         : http_start.ip,
              size       : response.getHeader('Content-Length') || null
            }
          });

          http_start = null;
        });

        return listener.apply(self, args);
      });
    };
  });
  return http;
};
