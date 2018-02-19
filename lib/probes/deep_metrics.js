
var semver = require('semver')

var MetricsCollector = module.exports = {}

var processors = [
  {
    name: 'http-outbound',
    nodule: require('./http-outbound')
  },
  {
    name: 'mongodb',
    nodule: require('./mongodb')
  },
  {
    name: 'redis',
    nodule: require('./redis')
  },
  {
    name: 'mysql',
    nodule: require('./mysql')
  },
  {
    name: 'socketio',
    nodule: require('./socketio')
  },
  {
    name: 'mqtt',
    nodule: require('./mqtt')
  }
]

MetricsCollector.enable = function (pmx) {
  if (semver.lt(process.version, '4.0.0')) {
    return console.error('Deep metrics collection is active but required nodejs 4, disabling ...')
  }

  var deepmetrics = require('deep-metrics')
  deepmetrics.start()
  processors.forEach(function (processor) {
    processor.nodule(pmx, deepmetrics.ee)
  })
}
