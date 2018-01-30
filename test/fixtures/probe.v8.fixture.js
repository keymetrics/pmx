var axm = require('../..');
var http = require('http');

axm.init({
  v8: true
});

http.createServer(function (req, res) {
  res.end('Thanks');
}).listen(3400);
