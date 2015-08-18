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
var Sample    = require('./sample.js');
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
      this.sample = new Sample(180 || opts.interval);
      this.cmp = function(value, threshold) {
        this.sample.update(value);
        if (this.start) {
          if (typeof(opts.cmp) !== 'undefined')
            return opts.cmp(this.sample.getMean(), threshold);
          return (this.sample.getMean() > threshold)
        }
      }
      break;
    case 'smart':
      this.sample = new Sample(300 || opts.interval);
      this.small = new Sample(30 || opts.sample);
      this.cmp = function(value, threshold) {
        this.sample.update(value);
        this.small.update(value);
        //debug('Check', value, this.sample.getMean(), this.small.getMean());

if (this.start)
          return (((this.small.getMean() - this.sample.getMean()) / this.sample.getMean()) > 0.2)
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
