/*
 * Alert System for Probes
 *
 *  var Alert = new Alert({
 *    mode  : 'threshold',  //required
 *    value : 75,           //required
 *    msg   : 'Value is over threshold',
 *    func  : function(){ console.log( 'error detected'); },
 *    cmp   : function(val, threshold){ return (val > threshold); }
 *  });
 * var Alert = new Alert({
 *    mode    : 'smart',    //required
 *    msg     : 'Smart Exception Detected',
 *    func    : function(){ console.log( 'error detected'); },
 *    timeout : 30000
 *  });
 */

var Notify    = require('../notify.js');
var Histogram = require('./probes/Histogram.js');
var EDS       = require('./EDS.js');
var units     = require('./units.js');
var debug     = require('debug')('axm:alert:checker');

var Alert = function(opts) {
  var self = this;
  if (typeof(opts.mode) === 'undefined')
    return console.error('[Probe][Metric] Mode undefined!');
  switch(opts.mode) {
    case 'threshold':
      if (typeof(opts.value) === 'undefined')
        return console.error('[Probe][Metric][threshold] Val undefined!');
      this.cmp = opts.cmp || function(a,b) { return (a > b); };
      break;
    case 'threshold-avg':
      if (typeof(opts.value) === 'undefined')
        return console.error('[Probe][Metric][threshold-avg] Val undefined!');
      this.sample = new EDS({ size : 180 });
      this.cmp = function(value, threshold) {
        this.sample.update(value);
        if (this.start) {
          console.log(this.sample.avg() + ' val: ' + value);
          if (typeof(opts.cmp) !== 'undefined')
            return opts.cmp(this.sample.avg(), threshold);
          return (this.sample.avg() > threshold)
        }
      }
      break;
    case 'smart':
      this.sample = new EDS();
      this.small = new EDS({ size : 180 });
      this.cmp = function(value, threshold) {
        this.sample.update(value);
        this.small.update(value);
        if (this.start)
          return (((this.small.avg() - this.sample.avg()) / this.sample.avg()) > 0.2)
        return false;
      };
      break;
    default:
      return console.error('[Probe][Metric] Mode does not exist!');
  }
  this.start = false;
  //Start the data checking after 30s (default)
  setTimeout(function() {
    self.start = true;
  }, opts.timeout || 30000);
  this.reached = 0;
  this.threshold =  opts.value || null;
  this.issue = new Error(opts.msg || 'Probe alert : ' + opts.mode);
  this.func = opts.func || null;
}

Alert.prototype.tick = function(value) {
  if (this.reached === 0) {
    if (this.cmp(value, this.threshold)) {
      Notify.notify(this.issue);
      if (this.func)
        this.func();
      this.reached = 1;
    }
  }
  else {
    if (!this.cmp(value, this.threshold))
      this.reached = 0;
  }
}


module.exports = Alert;
