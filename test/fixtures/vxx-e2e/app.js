
var pmx = require('../../..');

global._db = {};

var mongoose = require('mongoose');
var Schema   = mongoose.Schema, ObjectID = Schema.ObjectId;
var express = require('express');
var app = express();
var http = require('http');
var pmx = require('../../..').init({ transactions: true });

// What the other option to ignore stuff on vxx?

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

app.get('/users/:id/test', function(req, res){
  console.log('hello /test');
  setTimeout(function() {
    res.send('Hello test');
  }, 200);
});

app.get('/error', function(req, res, next){
  next(new Error('toto'));
});

/**
 * Database style queries
 */

(function bindSchema() {
  var UserSchema = new Schema({
    username : 'string',
    name : 'string',
    phone : 'string'
  });

  _db.User = mongoose.model('User', UserSchema);
})();

function connectToMongoDB(cb) {
  var mongoDB = mongoose.connection;

  mongoose.connect('mongodb://localhost/test');

  mongoDB.on('error', function cb() {
    console.log('Error when connecting to db ');
  });

  mongoDB.once('open', function cb() {
    console.log('Successfully connected to database ');
  });

  return cb(null, mongoDB);
}

app.get('/db1/save', function(req, res) {
  var user = new _db.User({
    username : 'yolo',
    phone    : '06'
  });

  user.save(function() {
    res.send(user);
  });
});

app.get('/db1/get', function(req, res) {
  var q = _db.User.find();

  q.exec(function(err, users) {
    res.send({users: users});
  });
});

app.get('/db1/inquisitor', function(req, res) {
  var time = req.query.timeout || Math.floor(Math.random() * (1000 - 100)) + 100;
  setTimeout(function () {
    res.send(200);
  }, time);
});

app.get('/db1/multi', function(req, res) {
  process.nextTick(function() {
    var q = _db.User.find();

    q.exec(function(err, users) {
      setTimeout(function() {
        var q2 = _db.User.findOne({}, function(err, us) {
          res.send({users: users, one : us});
        });
      }, 100);
    });
  });
});

connectToMongoDB(function() {});

app.use(pmx.expressErrorHandler());

app.listen(3001, function() {
  if (process.send)
    process.send('ready');
});

function doQuery(url) {
  var options = {
    hostname : '127.0.0.1',
    port     : 3001,
    path     : url,
    method   : 'GET',
    headers  : { 'Content-Type': 'application/json' }
  };

  var req = http.request(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (data) {
      //console.log(data);
    });
  });
  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });
  req.end();
}

pmx.action('launchMock', function(reply) {

  for (var i = 0; i < 10; i++) {
    doQuery('/');
    doQuery('/users/' + i + '/get');
    doQuery('/users/' + i + '/test');
  }

  reply('launched');
});

pmx.action('launchQueryToDbRoutes', function(reply) {
  for (var i = 0; i < 10; i++) {
    doQuery('/db1/save');
  }
  reply('launched');
});

pmx.action('db1get', function(reply) {
  for (var i = 0; i < 1; i++) {
    doQuery('/db1/get');
  }
  reply('launched');
});

pmx.action('Inquistor', function(reply) {
  for (var i = 0; i < 10; i++) {
    doQuery('/db1/inquisitor');
  }
  reply('launched');
});

pmx.action('triggerInquisitor', function(reply) {
  for (var i = 0; i < 10; i++) {
    doQuery('/db1/inquisitor?time=9000');
  }
  reply('launched');
});

pmx.action('db1multi', function(reply) {
  for (var i = 0; i < 10; i++) {
    doQuery('/db1/multi');
  }
  reply('launched');
});
