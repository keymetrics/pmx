
//var pmx = require('../../..').init({ transactions: true });

var express = require('express');
var app = express();

var pmx = require('..').init({ custom_probes: true });

/**
 * Basic transaction testing
 */
app.get('/', function(req, res){
  console.log('hello /');
  res.send('Hello /');
});

app.get('/users/:id/get', function(req, res){
  console.log('hello /get');
  res.send('Hello user');
});

app.listen(3001, function() {
  console.log('Listening');
});
