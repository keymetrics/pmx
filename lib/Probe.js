
var Counter   = require('./utils/probes/Counter.js');
var Histogram = require('./utils/probes/Histogram.js');
var Meter     = require('./utils/probes/Meter.js');
var Smart     = require('./utils/datachecker.js');

var Notify    = require('./notify.js');
var Transport = require('./utils/transport.js');

var debug     = require('debug')('axm:probe');
var Probe = {};

Probe._started = false;
Probe._var     = {};

Probe.AVAILABLE_AGG_TYPES  = ['avg', 'min', 'max', 'sum', 'none'];
Probe.AVAILABLE_MEASUREMENTS = [
  'min',
  'max',
  'sum',
  'count',
  'variance',
  'mean',
  'stddev',
  'median',
  'p75',
  'p95',
  'p99',
  'p999'
];
Probe.default_aggregation     = 'avg';

function getValue(value) {
  if (typeof(value) == 'function')
    return value();
  return value;
}

function cookData(data) {
  var cooked_data = {};

  Object.keys(data).forEach(function(probe_name) {
    
    cooked_data[probe_name] = {
      value: getValue(data[probe_name].value)
    };

    if (data[probe_name].agg_type &&
        data[probe_name].agg_type != 'none')
      cooked_data[probe_name].agg_type = data[probe_name].agg_type;

  });
  return cooked_data;
};

function checkIssues(data) {
  Object.keys(data).forEach(function(probe_name) {
    if (typeof(data[probe_name].issue) != 'undefined') {
      if (data[probe_name].reached === 0) {
        if (data[probe_name].cmp(getValue(data[probe_name].value), data[probe_name].threshold)) {
          Notify.notify(data[probe_name].issue);
          data[probe_name].func();
          data[probe_name].reached = 1;
        }
      }
      else {
        if (data[probe_name].cmp(getValue(data[probe_name].value), data[probe_name].threshold) )
          data[probe_name].reached = 0;
      }
    }
  });
};


Probe.probe = function() {

  if (Probe._started == false) {
    Probe._started = true;

    setInterval(function() {
      Transport.send({
        type : 'axm:monitor',
        data : cookData(Probe._var)
      });
      checkIssues(Probe._var);
    }, 990);
  }

  return {
    /**
     * This reflect data to keymetrics
     * pmx.transpose('prop name', fn)
     *
     * or
     *
     * pmx.transpose({
     *   name : 'variable name',
     *   data : function() { return value }
     * });
     */
    transpose : function(variable_name, reporter) {
      if (typeof variable_name === 'object') {
        reporter = variable_name.data;
        variable_name = variable_name.name;
      }

      if (typeof reporter !== 'function') {
        return console.error('[PMX] reporter is not a function');
      }

      Probe._var[variable_name] = {
        value: reporter
      };
    },
    metric : function(opts) {
      var agg_type = opts.agg_type || Probe.default_aggregation;

      if (!opts.name)
        return console.error('[Probe][Metric] Name not defined');
      if (typeof(opts.value) === 'undefined')
        return console.error('[Probe][Metric] Value not defined');
      if (Probe.AVAILABLE_AGG_TYPES.indexOf(agg_type) == -1)
        return console.error("[Probe][Metric] Unknown agg_type: %s", agg_type);

      if (opts.value)
        Probe._var[opts.name] = {
          value: opts.value,
          agg_type: agg_type
        };
      if (opts.alert) {
        if (typeof(opts.alert) === 'undefined')
          return console.error('[Probe][Metric] Notify undefined!');
        if (opts.alert.mode === 'threshold' && isNaN(opts.alert.val) === false) {
          Probe._var[opts.name].threshold =  opts.alert.val;
          Probe._var[opts.name].issue = new Error(opts.alert.msg || 'Threshold reached');
          Probe._var[opts.name].func = opts.alert.func || null;
          Probe._var[opts.name].cmp = opts.alert.cmp || function(a,b){ return (a > b); };
        }
        /*else {
          Probe._alert = new Smart({
            
          });*/
        }

      return {
        val : function() {
          var value = Probe._var[opts.name].value;

          if (typeof(value) == 'function')
            value = value();
         
          return value;
        },
        set : function(dt) { Probe._var[opts.name].value = dt },
      }
    },
    histogram : function(opts) {
      if (!opts.name)
        return console.error('[Probe][Histogram] Name not defined');
      opts.measurement = opts.measurement || 'mean';
      opts.unit = opts.unit || '';
      var agg_type = opts.agg_type || Probe.default_aggregation;

      if (Probe.AVAILABLE_MEASUREMENTS.indexOf(opts.measurement) == -1)
        return console.error('[Probe][Histogram] Measure type %s does not exists', opts.measurement);
      if (Probe.AVAILABLE_AGG_TYPES.indexOf(agg_type) == -1)
        return console.error("[Probe][Metric] Unknown agg_type: %s", agg_type);

      var histogram = new Histogram(opts);

      Probe._var[opts.name] = {
        value: function() { return (Math.round(histogram.val() * 100) / 100) + '' + opts.unit },
        agg_type: agg_type
      };

      return histogram;
    },
    meter : function(opts) {
      var agg_type = opts.agg_type || Probe.default_aggregation;

      if (!opts.name)
        return console.error('[Probe][Meter] Name not defined');
      if (Probe.AVAILABLE_AGG_TYPES.indexOf(agg_type) == -1)
        return console.error("[Probe][Metric] Unknown agg_type: %s", agg_type);

      opts.unit = opts.unit || '';

      var meter = new Meter(opts);

      Probe._var[opts.name] = {
        value: function() { return meter.val() + '' + opts.unit },
        agg_type: agg_type
      };

      return meter;
    },
    counter : function(opts) {
      var agg_type = opts.agg_type || Probe.default_aggregation;

      if (!opts.name)
        return console.error('[Probe][Counter] Name not defined');
      if (Probe.AVAILABLE_AGG_TYPES.indexOf(agg_type) == -1)
        return console.error("[Probe][Metric] Unknown agg_type: %s", agg_type);

      var counter = new Counter();

      Probe._var[opts.name] = {
        value: function() { return counter.val() },
        agg_type: agg_type
      };
      return counter;
    },
  }
};

module.exports = Probe;
