
var pmx = require('./');

pmx.scopedAction('testo', function(data, emitter, cb) {
  var i = setInterval(function() {
    emitter('datarandmj');
  }, 100);

  console.log('asdasdasdasdasd');
  setTimeout(function() {
    clearInterval(i);
    return cb({success:true});
  }, 10000);
});
