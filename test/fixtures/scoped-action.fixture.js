

var pmx = require('../..');

pmx.scopedAction('scoped:action', function(data, emitter, cb) {
  var i = setInterval(function() {
    // Emit progress data
    emitter('data random');
  }, 100);

  setTimeout(function() {
    clearInterval(i);
    return cb({success:true});
  }, 800);
});
