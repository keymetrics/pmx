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

var Notify = require('../notify.js');
var Histogram = require('./probes/Histogram.js');
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
      this.hist = new Histogram();
      this.start = false;
      //Start the data checking after 30s (default)
      setTimeout(function() {
        self.start = true;
      }, opts.timeout || 30000);
      this.cmp = function(value, threshold) {
        this.hist.update(value);
        if (this.start) {
          if (typeof(opts.cmp) !== 'undefined')
           return opts.cmp(this.hist._calculateMean(), threshold);
          return (this.hist._calculateMean() > threshold);
        }
        return false;
      };
      break;
    case 'smart':
      this.hist = new Histogram();
      this.start = false;
      //Start the data checking after 30s (default)
      setTimeout(function() {
        self.start = true;
      }, opts.timeout || 30000);
      this.cmp = function(value, threshold) {
        this.hist.update(value);
        //debug('Check', value, this.hist._calculateMean(), this.hist.getEma());
        if (this.start)
          //if > 10% variation between moving average and exponential moving average
          return (((this.hist.getEma() - this.hist._calculateMean()) / this.hist._calculateMean()) > 0.1)
        return false;
      };
      break;
    default:
      return console.error('[Probe][Metric] Mode does not exist!');
  }
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
