/*
 * Alert System for Probes
 *
 *  var Alert = new Alert({
 *    mode  : 'threshold',  //required
 *    val   : 290,          //required
 *    msg   : 'Value is under threshold',
 *    func  : function(){ console.log( 'error detected'); },
 *    cmp   : function(val, threshold){ return (val < threshold); }
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

Alert = function(opts) {
  if (typeof(opts.mode) === 'undefined')
    return console.error('[Probe][Metric] Mode undefined!');
  switch(opts.mode) {
    case 'threshold':
      if (typeof(opts.val) === 'undefined')
        return console.error('[Probe][Metric][threshold] Val undefined!');
      this.issue = new Error(opts.msg || 'Data Threshold Exception');
      this.threshold =  opts.val;
      this.cmp = opts.cmp || function(a,b) { return (a > b); };
      break;
    case 'smart':
      this.issue = new Error(opts.msg || 'Data Smart Exception');
      this.hist = new Histogram({
      });
      this.threshold = null;
      //
      this.start = false;
      setTimeout(function() {
        this.start = true;
      }, opts.timeout || 30000);
      this.cmp = function(value, threshold) {
        this.hist.update(value); 
        //debug('Check', value, this.hist._calculateMean(), this.hist.getEma());
        if (this.start)
          return (((this.hist.getEma() - this.hist._calculateMean()) / this.hist._calculateMean()) > 0.1)
        return false;
      };
      break;
    default:
      return console.error('[Probe][Metric] Mode does not exist!');
  }
  this.reached = 0;
  this.func = opts.func || null;
}

Alert.prototype.tick = function(value) {
  if (this.reached === 0) {
    if (this.cmp(value, this.threshold)) {
      Notify.notify(this.issue);
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
