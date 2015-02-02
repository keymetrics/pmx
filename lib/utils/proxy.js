
var debug = require('debug')('proxy');

// var cls     = require('continuation-local-storage');
// var ns      = cls.createNamespace('namespace');

var Proxy = module.exports = {
  wrap : function(object, methods, hook) {
    var self = this;

    if (!Array.isArray(methods)) methods = [methods];

    methods.forEach(function(method) {
      var original = object[method];
      if (!original) return debug('Method %s unknown', method);
      if (original.__axm_original) return debug('Already wrapped', object);

      var hooked = hook(original);

      hooked.__axm_original = original;
      object[method] = hooked;
      debug('Method proxified');
    });
  }
};
