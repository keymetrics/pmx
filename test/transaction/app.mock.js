

var axm = require('../..');

axm.http();

var express = require('express');
var app = express();

app.get('/', function(req, res) {
  res.send(202, {success:true});
});

app.get('/nothing', function(req, res) {
  res.send('yes');
});


app.get('/slowly', function(req, res) {
  setTimeout(function() {
    res.send('yes');
  }, 100);
});


app.get('/nothing2', function(req, res) {
  setTimeout(function() {
    res.send('yes');
  }, 1000);
});


app.listen(9007);
