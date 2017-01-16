
process.env.NODE_ENV = 'local_test';
process.env.KM_URL_REFRESH_RATE = 1000;

var axon       = require('pm2-axon');
var PM2        = require('pm2');

var sub;

function listen(cb) {
  sub = axon.socket('sub');
  sub.bind(8080, cb);
}

function listenRev(cb) {
  var listener_server = require('nssocket').createServer(function(_socket) {
  });

  listener_server.listen(4322, '0.0.0.0', function() {
    console.log('Reverse interact online');
    cb();
  });
}

describe('Programmatically test interactor', function() {
  this.timeout(8000);
  var pm2;

  before(function(done) {
    listen(function() {
      listenRev(function() {

        pm2 = new PM2.custom({
          public_key : 'xxx',
          secret_key : 'yyy',
          cwd        : __dirname + '/fixtures/vxx-e2e'
        });

        pm2.connect(function() {
          done();
        });
      });
    });
  });

  after(function(done) {
    pm2.kill(done);
  });

  describe('application testing', function() {
    it('should start test application', function(done) {
      sub.once('message', function(data) {
        var packet = JSON.parse(data);
        packet.data['process:event'].length.should.eql(2)
        done();
      });

      pm2.start({
        script : 'app.js',
        name   : 'API',
        trace  : true
      }, function(err, data) {
        if (err) done(err);
      });
    });

    it('should get transaction trace via interactor output', function(done) {
      pm2.trigger('API', 'launchMock');

      (function callAgain() {
        sub.once('message', function(data) {
          var packet = JSON.parse(data);

          if (packet.data['axm:transaction']) {

            // Only one app
            packet.data['axm:transaction'].length.should.eql(1);

            // Should only find 3 different routes
            Object.keys(packet.data['axm:transaction'][0].data.routes).length.should.eql(3);

            var route;

            packet.data['axm:transaction'][0].data.routes.forEach(function(_route) {
              if (_route.path == '/')
                route = _route;
            });

            route.meta.should.have.properties(['mean', 'max', 'min', 'count']);
            route.variances.length.should.eql(1);
            done();
          }
          else callAgain();
        });
      })()
    });

    it('should get database transaction trace (save)', function(done) {
      pm2.trigger('API', 'launchQueryToDbRoutes');

      (function callAgain() {
        sub.once('message', function(data) {
          var packet = JSON.parse(data);

          if (packet.data['axm:transaction']) {
            packet.data['axm:transaction'][0].data.routes.length.should.eql(4);

            packet.data['axm:transaction'][0].data.routes.forEach(function(_route) {
              if (_route.path == '/db1/save') {
                _route.variances.length.should.eql(1);
                _route.meta.should.have.properties(['mean', 'max', 'min', 'count']);
                _route.variances[0].spans[1].name.should.eql('mongo-insert');
              }
            });
            done();
          }
          else
            callAgain();
        });
      })()
    });

    it('should get simple database transaction trace (find)', function(done) {
      pm2.trigger('API', 'db1get');

      setTimeout(function() {
        (function callAgain() {
          sub.once('message', function(data) {
            var packet = JSON.parse(data);

            if (packet.data['axm:transaction']) {
              // Should now route summary contains 5 routes
              Object.keys(packet.data['axm:transaction'][0].data.routes).length.should.eql(5);

              // @bug: should contain only 1 transaction not 2 (only find)
              packet.data['axm:transaction'][0].data.routes.forEach(function(_route) {
                if (_route.path == '/db1/get') {
                  _route.variances.forEach(function(vari) {
                    vari.spans.length.should.eql(2);
                  });
                }
              });
              done();
            }
            else
              callAgain();
          });
        })()
      }, 1000);
    });

    it('should get multi database transaction trace (find + findOne)', function(done) {
      (function callAgain() {
        sub.once('message', function(data) {
          var packet = JSON.parse(data);

          if (packet.data['axm:transaction']) {
            // Should now route summary contains 5 routes
            Object.keys(packet.data['axm:transaction'][0].data.routes).length.should.eql(6);

            // @bug: should contain only 1 transaction not 2 (only find)
            packet.data['axm:transaction'][0].data.routes.forEach(function(_route) {
              if (_route.path == '/db1/multi') {
                _route.variances.forEach(function(vari) {
                  vari.spans.length.should.eql(3);
                });
              }
            });

            done();
          }
          else
            callAgain();
        });
      })()

      pm2.trigger('API', 'db1multi');
    });


  });

});
