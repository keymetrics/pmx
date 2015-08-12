


var pmx = require('../index.js');

var Probe = pmx.probe();

// if null metric probe does not work
var slow_val = 0;

setInterval(function() {
  slow_val++;
  dt.set(slow_val);
}, 500);

var dt = Probe.metric({
  name : 'test',
  alert : {
    mode     : 'threshold',
    val      : 30,
    //interval : 60, // seconds
    msg      : 'val too hight'
  }
});
