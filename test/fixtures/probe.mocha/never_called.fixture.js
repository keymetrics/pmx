var pmx = require('../../..');
var probe = pmx.probe();

probe.histogram({
  name : 'test'
});

probe.metric({
  name : 'metric-test'
});

probe.counter({
  name : 'counter-test'
});

probe.meter({
  name : 'meter-test'
});

setInterval(function() {
  // keep event loop active
}, 1000);
