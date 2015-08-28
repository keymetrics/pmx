var Notify    = require('../notify.js');
var Sample    = require('./sample.js');
var debug     = require('debug')('axm:alert:checker');

var Alert = function(opts) {
  var self = this;
  if (typeof(opts.mode) === 'undefined')
    return console.error('[Probe][Metric] Mode undefined!');
  if (typeof(opts.cmp) !== 'undefined' && typeof(opts.cmp) === 'string') {
    switch(opts.cmp) {
      case '<':
        var cmp = function(a,b) {
          return (a > b);
        };
        break;
      case '>':
        var cmp = function(a, b) {
          return (a < b);
        };
        break;
      case '=':
        var cmp = function(a,b) {
          return (a === b);
        };
        break;
      default:
        return console.error('[Probe][Metric] Mode does not exist!');
    }
    opts.cmp = null;
  }
  else {
    var cmp = function(a,b) {
      return (a > b);
    }
  }
  switch(opts.mode) {
    case 'threshold':
      if (typeof(opts.value) === 'undefined')
        return console.error('[Probe][Metric][threshold] Val undefined!');
      this.cmp = opts.cmp || function(a,b) {
        return cmp(parseFloat(a), b);
      };
      break;
    case 'threshold-avg':
      if (typeof(opts.value) === 'undefined')
        return console.error('[Probe][Metric][threshold-avg] Val undefined!');
      this.sample = new Sample(opts.interval || 180);
      this.cmp = function(value, threshold) {
        this.sample.update(parseFloat(value));
        if (this.start) {
          if (typeof(opts.cmp) !== 'undefined')
            return opts.cmp(this.sample.getMean(), threshold);
          return cmp(this.sample.getMean(), threshold);
        }
      }
      break;
    case 'smart':
      this.sample = new Sample(opts.interval || 300);
      this.small = new Sample(opts.sample || 30);
      this.cmp = function(value, threshold) {
        this.sample.update(parseFloat(value));
        this.small.update(parseFloat(value));
        //debug('Check', value, this.sample.getMean(), this.small.getMean());

if (this.start)
          return (((this.small.getMean() - this.sample.getMean()) / this.sample.getMean()) > 0.2)
        return false;
      };
      break;
    default:
      return console.error('[Probe][Metric] Mode does not exist!');
  }
  this.mode = opts.mode;
  this.start = false;
  //Start the data checking after 30s (default)
  setTimeout(function() {
    self.start = true;
  }, opts.timeout || 30000);
  this.reached = 0;
  this.threshold =  opts.value || null;
  this.issue = new Error(opts.msg || 'Probe alert : ' + opts.mode);
  this.func = opts.func || opts.action || null;
}

Alert.prototype.tick = function(value) {
  if (this.reached === 0) {
    if (this.cmp(value, this.threshold)) {
      Notify.notify(this.issue);
      if (this.func)
        this.func(value);
      this.reached = 1;
    }
  }
  else {
    if (!this.cmp(value, this.threshold))
      this.reached = 0;
  }
}

module.exports = Alert;
