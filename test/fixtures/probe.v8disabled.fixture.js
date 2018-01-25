
var axm = require('../..');
axm.init({
  v8: false
});

var http  = require('http');

http.createServer(function(req, res) {
    res.end('Thanks');
}).listen(3400);
