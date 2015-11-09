
var pmx = require('../../../..');

var conf = pmx.init();

var data = 0;

//console.log(conf);
var probe = pmx.probe();
// Here we are going to call valvar.set() to set the new value
var valvar = probe.metric({
  name    : 'Realtime Value',
  value : function() { return data }
});

pmx.action('db:clean', function(reply) {
  data++;
});
