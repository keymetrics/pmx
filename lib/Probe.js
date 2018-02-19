
var Counter   = require('./utils/probes/Counter.js');
var Histogram = require('./utils/probes/Histogram.js');
var Meter     = require('./utils/probes/Meter.js');
var Alert     = require('./utils/alert.js');

var Transport = require('./utils/transport.js');

var debug     = require('debug')('axm:probe');
var util      = require('util');
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
Probe.default_aggregation = 'avg';
Probe.default_type = 'user';

function getValue(value) {
  if (typeof(value) == 'function')
    return value();
  return value;
}

/**
 * Data that will be sent to Keymetrics
 */
function cookData(data) {
  var cooked_data = {};

  Object.keys(data).forEach(function(probe_name) {

    if (typeof(data[probe_name].value) == 'undefined')
      return false;

    cooked_data[probe_name] = {
      value: getValue(data[probe_name].value)
    };

    /**
     * Attach aggregation mode
     */
    if (data[probe_name].agg_type &&
        data[probe_name].agg_type != 'none')
      cooked_data[probe_name].agg_type = data[probe_name].agg_type;

    cooked_data[probe_name].historic = data[probe_name].historic;
    cooked_data[probe_name].type = data[probe_name].type;

    //if (data[probe_name].unit)
    cooked_data[probe_name].unit = data[probe_name].unit;

    /**
     * Attach Alert configuration
     */
    if (data[probe_name].alert)
      cooked_data[probe_name].alert = data[probe_name].alert.serialize();
    else
      cooked_data[probe_name].alert = {};

  });
  return cooked_data;
};

/**
 * Tick system for Alerts
 */
function checkIssues(data) {
  Object.keys(data).forEach(function(probe_name) {
    if (typeof(data[probe_name].alert) !== 'undefined') {
      data[probe_name].alert.tick(getValue(data[probe_name].value));
    }
  });
};

function historicEnabled(historic) {
  if (historic === false)
    return false;
  if (typeof(historic) === 'undefined')
    return true;
  return true;
}

function attachAlert(opts, conf) {
  /**
   * pm2 set module-name:probes:probe_name:value    20
   * pm2 set module-name:probes:probe_name:mode     'threshold-avg'
   * pm2 set module-name:probes:probe_name:cmp      '<'
   * pm2 set module-name:probes:probe_name:interval 20
   */
  var alert_opts = {};

  if (opts.alert)
    alert_opts = opts.alert;

  if (conf &&
      conf.probes &&
      conf.probes[opts.name]) {
    // Default mode
    if (!alert_opts.mode) alert_opts.mode = 'threshold';
    alert_opts = util._extend(alert_opts, conf.probes[opts.name]);
  }

  if (alert_opts && alert_opts.mode == 'none') return false;

  if (Object.keys(alert_opts).length > 0 && Probe._alert_activated == true) {
    Probe._var[opts.name].alert = new Alert(alert_opts, {name : opts.name});
  }
}

Probe.probe = function() {
  var self = this;
  // Get module configuration to enable alerts
  if (this.getConf && this.getConf())
    Probe._alert_activated = this.getConf().alert_enabled || true;
  else
    Probe._alert_activated = false;

  if (Probe._started == false) {
    Probe._started = true;

    var p_interval = setInterval(function() {
      Transport.send({
        type : 'axm:monitor',
        data : cookData(Probe._var)
      });
      checkIssues(Probe._var);
    }, 990);

    p_interval.unref();
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
      if (!opts.name)
        return console.error('[Probe][Metric] Name not defined');

      Probe._var[opts.name] = {
        value   : opts.value || 0,
        type    : opts.type || opts.name,
        historic: historicEnabled(opts.historic),
        agg_type: opts.agg_type || Probe.default_aggregation,
        unit : opts.unit
      };

      /**
       * Attach alert to: Probe._var[opts.name].alert
       */
      if (self.getConf)
        attachAlert(opts, self.getConf());

      return {
        val : function() {
          var value = Probe._var[opts.name].value;

          if (typeof(value) == 'function')
            value = value();

          return value;
        },
        set : function(dt) {
          Probe._var[opts.name].value = dt;
        }
      };
    },
    histogram : function(opts) {
      if (!opts.name)
        return console.error('[Probe][Histogram] Name not defined');

      opts.measurement = opts.measurement || 'mean';
      opts.unit = opts.unit || '';

      if (Probe.AVAILABLE_MEASUREMENTS.indexOf(opts.measurement) == -1)
        return console.error('[Probe][Histogram] Measure type %s does not exists', opts.measurement);

      var histogram = new Histogram(opts);

      Probe._var[opts.name] = {
        value: function() {
          return (Math.round(histogram.val() * 100) / 100) + '' + opts.unit
        },
        type    : opts.type || opts.name,
        historic: historicEnabled(opts.historic),
        agg_type: opts.agg_type || Probe.default_aggregation,
        unit : opts.unit
      };

      /**
       * Attach alert to: Probe._var[opts.name].alert
       */
      if (self.getConf)
        attachAlert(opts, self.getConf());

      return histogram;
    },
    meter : function(opts) {
      if (!opts.name)
        return console.error('[Probe][Meter] Name not defined');

      opts.unit = opts.unit || '';

      var meter = new Meter(opts);

      Probe._var[opts.name] = {
        value: function() {
          return meter.val() + '' + opts.unit
        },
        type    : opts.type || opts.name,
        historic: historicEnabled(opts.historic),
        agg_type: opts.agg_type || Probe.default_aggregation,
        unit : opts.unit
      };

      /**
       * Attach alert to: Probe._var[opts.name].alert
       */
      if (self.getConf)
        attachAlert(opts, self.getConf());

      return meter;
    },
    counter : function(opts) {
      if (!opts.name)
        return console.error('[Probe][Counter] Name not defined');

      var counter = new Counter();

      Probe._var[opts.name] = {
        value: function() { return counter.val() },
        type    : opts.type || opts.name,
        historic: historicEnabled(opts.historic),
        agg_type: opts.agg_type || Probe.default_aggregation,
        unit : opts.unit
      };

      /**
       * Attach alert to: Probe._var[opts.name].alert
       */
      if (self.getConf)
        attachAlert(opts, self.getConf());

      return counter;
    }
  }
};

module.exports = Probe;
