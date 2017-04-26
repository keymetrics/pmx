
var patchwork = require('../utils/patchwork.js');
var pmx = require('../..');

var ErrorWrapper = function(opts) {
  var Probe = pmx.probe();

  global.error_rate = Probe.meter({
    name : 'new Error',
    samples : 60
  });

  Error = patchwork(Error, "ErrorOriginal", {
    constructed: function (arg) {
      global.error_rate.mark();
      return ErrorOriginal(arg);
    }
  });
};

module.exports = ErrorWrapper;
