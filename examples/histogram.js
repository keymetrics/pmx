
var pmx = require('..');

var probe = pmx.probe();

var histo = probe.histogram({
  measurement : 'mean',
  name        : 'pmx:http:latency',
  unit        : 'ms'
});

var latency = 0;

setInterval(function() {
  latency = Math.round(Math.random() * 100);
  histo.update(latency);
}, 100);
