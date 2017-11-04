
<div align="center">
  <a href="http://pm2.keymetrics.io">
    <img width=411px src="https://raw.githubusercontent.com/keymetrics/pmx/master/pres/logo.png">
  </a>
  <br/>
  <b><a href="https://github.com/Unitech/pm2">PM2</a> programmatic integration</b>
  <br/>
  <br/>
  <a href="https://www.bithound.io/github/keymetrics/pmx">
<img src="https://www.bithound.io/github/keymetrics/pmx/badges/score.svg"/>
  </a>
  <a href="https://travis-ci.org/keymetrics/pmx">
<img src="https://api.travis-ci.org/keymetrics/pmx.png?branch=master"/>
  </a>
<br/>
<br/>
</div>


PMX allows you to create advanced interactions with [PM2](https://github.com/Unitech/pm2) and [Keymetrics.io](https://app.keymetrics.io/).

# Table of Contents

- [**Installation**](https://github.com/keymetrics/pmx/blob/master/README.md#installation)
- [**Expose Custom Metrics**](https://github.com/keymetrics/pmx#expose-metrics-measure-anything)
- [**Expose Triggerable Runtime Functions**](https://github.com/keymetrics/pmx#expose-functions-trigger-functions-remotely)
- [**Report Exceptions and Alerts**](https://github.com/keymetrics/pmx#alert-system-for-custom-metrics)
- [**Report Custom Events**](https://github.com/keymetrics/pmx#emit-events)
- [**Monitor network traffic**](https://github.com/keymetrics/pmx#application-level-network-traffic-monitoring--display-used-ports)

# Installation

Install pmx with npm:

```bash
$ npm install pmx --save
```

## Expose Metrics: Measure anything

PMX allows you to expose code metrics from your code to the PM2 monit command or the Keymetrics Dashboard, in realtime and over time.

4 measurements are available:

- **Simple metrics**: Values that can be read instantly
    - eg. Monitor variable value
- **Counter**: Things that increment or decrement
    - eg. Downloads being processed, user connected
- **Meter**: Things that are measured as events / interval
    - eg. Request per minute for a http server
- **Histogram**: Keeps a reservoir of statistically relevant values biased towards the last 5 minutes to explore their distribution
    - eg. Monitor the mean of execution of a query into database

### Metric: Simple value reporting

This allow to expose values that can be read instantly.

```javascript
var probe = pmx.probe();

// Here the value function will be called each second to get the value
// returned by Object.keys(users).length
var metric = probe.metric({
  name    : 'Realtime user',
  value   : function() {
    return Object.keys(users).length;
  }
});

// Here we are going to call valvar.set() to set the new value
var metric_2 = probe.metric({
  name    : 'Realtime Value'
});

metric_2.set(23);
```

#### Options

- **name**: Probe name
- **value**: (optional) function that allows to monitor a global variable

### Counter: Sequential value change

Things that increment or decrement.

```javascript
var probe = pmx.probe();

// The counter will start at 0
var counter = probe.counter({
  name : 'Current req processed'
});

http.createServer(function(req, res) {
  // Increment the counter, counter will eq 1
  counter.inc();
  req.on('end', function() {
    // Decrement the counter, counter will eq 0
    counter.dec();
  });
});
```

#### Options

- **name**: Probe name

### Meter: Average calculated values

Things that are measured as events / interval.

```javascript
var probe = pmx.probe();

var meter = probe.meter({
  name      : 'req/sec',
  samples   : 1  // This is per second. To get per min set this value to 60
});

http.createServer(function(req, res) {
  meter.mark();
  res.end({success:true});
});
```

#### Options

- **name**: Probe name
- **samples**: (optional)(default: 1) Rate unit. Defaults to **1** sec.
- **timeframe**: (optional)(default: 60) timeframe over which events will be analyzed. Defaults to **60** sec.

### Histogram

Keeps a resevoir of statistically relevant values biased towards the last 5 minutes to explore their distribution.

```javascript
var probe = pmx.probe();

var histogram = probe.histogram({
  name        : 'latency',
  measurement : 'mean'
});

var latency = 0;

setInterval(function() {
  latency = Math.round(Math.random() * 100);
  histogram.update(latency);
}, 100);
```

#### Options

- **name**: Probe name
- **agg_type** : (optional)(default: none) Can be `sum`, `max`, `min`, `avg` (default) or `none`. It will impact the way the probe data are aggregated within the **Keymetrics** backend. Use `none` if this is irrelevant (eg: constant or string value).
- **alert** : (optional)(default: null) For `Meter` and `Counter` probes.  Creates an alert object (see below).

## Expose Functions: Trigger Functions remotely

Remotely trigger functions from Keymetrics. These metrics takes place in the main Keymetrics Dashboard page under the Custom Action section.

### Simple actions

Simple action allows to trigger a function from Keymetrics. The function takes a function as a parameter (reply here) and need to be called once the job is finished.

Example:

```javascript
var pmx = require('pmx');

pmx.action('db:clean', function(reply) {
  clean.db(function() {
    /**
     * reply() must be called at the end of the action
     */
     reply({success : true});
  });
});
```

### Scoped actions (beta)

Scoped Actions are advanced remote actions that can be also triggered from Keymetrics.

Two arguments are passed to the function, data (optional data sent from Keymetrics) and res that allows to emit log data and to end the scoped action.

Example:

```javascript
pmx.scopedAction('long running lsof', function(data, res) {
  var child = spawn('lsof', []);

  child.stdout.on('data', function(chunk) {
    chunk.toString().split('\n').forEach(function(line) {
      res.send(line); // This send log to Keymetrics to be saved (for tracking)
    });
  });

  child.stdout.on('end', function(chunk) {
    res.end('end'); // This end the scoped action
  });

  child.on('error', function(e) {
    res.error(e);  // This report an error to Keymetrics
  });

});
```

### Alert System for Custom Metrics

**(Specific to Keymetrics)**

This alert system can monitor a Probe value and launch an exception when hitting a particular value.

Example for a `cpu_usage` variable:

```javascript
var metric = probe.metric({
  name  : 'CPU usage',
  value : function() {
    return cpu_usage;
  },
  alert : {
    mode  : 'threshold',
    value : 95,
    msg   : 'Detected over 95% CPU usage', // optional
    func  : function() { //optional
      console.error('Detected over 95% CPU usage');
    },
    cmp   : "<" // optional
  }
});
```

#### Options

- **mode** : `threshold`, `threshold-avg`.
- **value** : Value that will be used for the exception check.
- **msg** : String used for the exception.
- **func** :  **optional**. Function declenched when exception reached.
- **cmp** : **optional**. If current Probe value is not `<`, `>`, `=` to Threshold value the exception is launched. Can also be a function used for exception check taking 2 arguments and returning a bool.
- **interval** : **optional**, `threshold-avg` mode. Sample length for monitored value (180 seconds default).
- **timeout** : **optional**, `threshold-avg` mode. Time after which mean comparison starts (30 000 milliseconds default).

## Report Alerts: Errors / Uncaught Exceptions

**(Specific to Keymetrics)**

By default once PM2 is linked to Keymetrics, you will be alerted of any uncaught exception.
These errors are accessible in the **Issue** tab of Keymetrics.

### Custom alert notification

If you need to alert about any critical errors you can do it programmatically:

```javascript
var pmx = require('pmx');

pmx.notify({ success : false });

pmx.notify('This is an error');

pmx.notify(new Error('This is an error'));
```

### Add Verbosity to an Alert: Express Error handler

When an uncaught exception is happening you can track from which routes it has been thrown.
To do that you have to attach the middleware `pmx.expressErrorHandler` at then end of your routes mounting:

```javascript
var pmx = require('pmx');

// All my routes
app.get('/' ...);
app.post(...);
// All my routes

// Here I attach the middleware to get more verbosity on exception thrown
app.use(pmx.expressErrorHandler());
```

## Emit Events

Emit events and get historical and statistics.
This is available in the **Events** page of Keymetrics.

```javascript
var pmx = require('pmx');

pmx.emit('user:register', {
  user : 'Alex registered',
  email : 'thorustor@gmail.com'
});
```

## Application level network traffic monitoring / Display used ports

You can monitor the network usage of a specific application by adding the option `network: true` when initializing PMX. If you enable the flag `ports: true` when you init pmx it will show which ports your app is listenting on.

These metrics will be shown in the Keymetrics Dashboard in the Custom Metrics section.

Example:

```javascript
pmx.init({
  [...]
  network : true, // Allow application level network monitoring
  ports   : true  // Display ports used by the application
});
```

## Advanced PMX configuration


```javascript
var pmx = require('pmx').init({
  http          : true, // (default: true) HTTP routes logging
  custom_probes : true, // (default: true) Auto expose JS Loop Latency and HTTP req/s as custom metrics
  network       : true, // (default: false) Network monitoring at the application level
  ports         : true, // (default: false) Shows which ports your app is listening on

  // Transaction Tracing system configuration
  transactions  : true, // (default: false) Enable transaction tracing
  ignoreFilter: {
    'url': [],
    'method': ['OPTIONS']
  },
  // can be 'express', 'hapi', 'http', 'restify'
  excludedHooks: []
});
```

## License

MIT

[![GA](https://ga-beacon.appspot.com/UA-51122580-2/pmx/readme?pixel&useReferer)](https://github.com/igrigorik/ga-beacon)
