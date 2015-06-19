
var probe     = require('../Probe.js');
var Histogram = require('./probes/Histogram.js');
var debug     = require('debug')('axm:smart:checker');

function dataChecker(opts) {
  var self = this;
  this._counter = 0;

  opts = opts || {};

  if (typeof(opts.refresh) !== 'function')
    throw new Error('Refresh not defined or not a function');

  this._refresh = opts.refresh;

  this._timer = opts.timer || 100;
  this._dev   = opts.dev || 0.2;
  this._callback = opts.callback || null;
  this._histogram = new Histogram();

  var base = opts.base || 'ema';
  var methods  = {
    mean  : this._histogram._calculateMean,
    ema   : this._histogram.getEma
  };
  this._base_fn = methods[base];

  /**
   * Display some probe if we need to debug
   */
  if (opts.debug === true) {
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

  this.start();
};

dataChecker.prototype.stop = function() {
  clearInterval(this._interval_timer);
};

dataChecker.prototype.start = function() {
  var self = this;

  debug('Checker started');

  this._interval_timer = setInterval(function() {
    self._histogram.update(self._refresh());

    debug('Check', self._histogram.getEma(), self._refresh());

    if ((self._refresh() - self._histogram.getEma()) / self._histogram.getEma() > self._dev) {
      debug('Anomaly detected', self._histogram.getEma(), self._refresh());
      self._counter++;
      self._callback();
    }
  }, self._timer);
};

module.exports = dataChecker;
