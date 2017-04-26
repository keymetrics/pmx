
var patchwork = require('../utils/patchwork.js');

var ErrorWrapper = function(opts) {
  var pmx = require('../..');

  var Probe = pmx.probe();

  global.__km_error_rate = Probe.meter({
    name : 'new Error',
    samples : 60
  });

  Error = patchwork(Error, "ErrorOriginal", {
    constructed: function (arg) {
      global.__km_error_rate.mark();
      return ErrorOriginal(arg);
    }
  });
};

module.exports = ErrorWrapper;
