var probe = require('../Probe.js');
var Histogram = require('../utils/probes/Histogram.js');

function dataChecker(opts) {
  var self = this;
  this._counter = 0;

  opts = opts || {};
  if (typeof(opts.refresh) !== 'function')
    return null;
  this._refresh = opts.refresh;
  
  this._timer = opts.timer || 100;
  this._dev = opts.dev || 0.2;
  this._histogram = new Histogram();
  this._metric1 = new probe.metric({
    name  : 'Error Counter',
    value : function() {
      return self._counter;
    }
  });

  var base = opts.base || 'ema';
  var methods  = {
    mean  : this._histogram._calculateMean,
    ema   : this._histogram.getEma
  }
  this._base_fn = methods[base];
  if (typeof(opts.probes) != 'undefined') {
    if (opts.probes.indexOf('val') != -1) {
      this._metric2 = new probe.metric({
        name  : 'Value',
        value : function() {
          return self._refresh();
        }
      });
    }
    if (opts.probes.indexOf('ema') != -1) {
      this._metric3 = new probe.metric({
        name  : 'EMA',
        value : function() {
          return self._histogram.getEma();
        }
      });
    }
    if (opts.probes.indexOf('mean') != -1) {
      this._metric4 = new probe.metric({
       name  : 'Mean',
       value : function() {
         return self._histogram._calculateMean();
       }
      });
    }
  }
  setInterval(function() {
    self._histogram.update(self._refresh());
    if ((self._refresh() - self._histogram.getEma()) / self._histogram.getEma() > self._dev) {
      self._counter++;
      //var err = new Error('Spike');
      //pmx.notify(err);
    }
  }, 100);
};

module.exports = dataChecker;
