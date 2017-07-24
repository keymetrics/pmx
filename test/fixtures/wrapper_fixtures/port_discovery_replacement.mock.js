

require('../../..').init({
  new_port : 20000
});

var express = require('express');
var app = express();

app.get('/', function(req, res) {
  res.send({success:true});
});

app.get('/nothing', function(req, res) {
  res.send('yes');
});

app.listen(9007);
