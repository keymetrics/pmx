
process.env.NODE_ENV = 'local_test';
process.env.KM_URL_REFRESH_RATE = 1000;

var axon = require('pm2-axon');
var PM2 = require('pm2');
var semver = require('semver');

if (!semver.satisfies(process.version, '>= 4.0.0'))
  process.exit(0);

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
          pm2.kill(function() {
            pm2.connect(function() {
              done();
            })
          });
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
        trace : true
      }, function(err, data) {
        if (err)
          done(err);
      });
    });

    it('should get transaction trace via interactor output', function(done) {
      (function callAgain() {
        sub.once('message', function(data) {
          var packet = JSON.parse(data);

          if (packet.data['axm:transaction']) {

            var sp_c1 = packet.data['axm:transaction'].length;
            // Only one app
            if (sp_c1 != 2 && sp_c1 != 1)
              return done(new Error('not span received'))
            data = packet.data['axm:transaction'][0].data;

            if (Object.keys(data.routes).length != 3)
              return callAgain();

            var sp_c = Object.keys(data.routes).length;

            if (sp_c != 3 && sp_c != 2)
              return done(new Error('not span received'))
            // Should only find 3 different routes
            //Object.keys(data.routes).length.should.eql(3);
            data.routes[0].should.have.properties(['meta', 'variances', 'path']);
            data.routes[0].meta.should.have.properties(['min', 'max', 'median', 'count', 'p95']);
            var route = data.routes[0];

            // Right property keys
            route.meta.should.have.properties(['min', 'max', 'median', 'meter', 'count', 'p95']);
            route.variances[0].should.have.properties(['min', 'max', 'median', 'count', 'p95']);
            route.variances[0].spans[0].should.have.properties(['min', 'max', 'median', 'kind', 'labels', 'name']);

            done();
          }
          else callAgain();
        });
      })()

      pm2.trigger('API', 'launchMock');
    });

    it('should get database transaction trace (save)', function(done) {
      (function callAgain() {
        sub.once('message', function(data) {
          var packet = JSON.parse(data);

          if (packet.data['axm:transaction']) {
            var data = packet.data['axm:transaction'][0].data;
            // Should now route summary contains 4 routes
            if (Object.keys(data.routes).length < 4)
              return callAgain();

            Object.keys(data.routes).length.should.eql(4);

            var route = data.routes.filter(function (route) {
              return route.path === '/db1/save';
            })[0];

            if (!route) return callAgain();

            // Should count 10 transactions
            route.variances[0].count.should.eql(10);
            route.variances[0].spans.length.should.eql(2);

            route.variances[0].spans[1].name.should.eql('mongo-insert');
            done();
          }
          else
            callAgain();
        });
      })()

      pm2.trigger('API', 'launchQueryToDbRoutes');
    });

    it('should get simple database transaction trace (find)', function(done) {
      (function callAgain() {
        sub.once('message', function(data) {
          var packet = JSON.parse(data);

          if (packet.data['axm:transaction']) {
            var data = packet.data['axm:transaction'][0].data;

            var route = data.routes.filter(function (route) {
              return route.path === '/db1/get';
            })[0];

            if (!route) return callAgain();

            // Should now route summary contains 5 routes
            Object.keys(data.routes).length.should.eql(5);

            // @bug: should contain only 1 transaction not 2 (only find)
            var c_rv = route.variances[0].spans.length;
            if (c_rv != 2 && c_rv != 3)
              return done(new Error('no transactiom'));

            done();
          }
          else
            callAgain();
        });
      })()

      pm2.trigger('API', 'db1get');
    });

    it('should get multi database transaction trace (find + findOne)', function(done) {
      (function callAgain() {
        sub.once('message', function(data) {
          var packet = JSON.parse(data);

          if (packet.data['axm:transaction']) {
            var data = packet.data['axm:transaction'][0].data;

            var route = data.routes.filter(function (route) {
              return route.path === '/db1/multi';
            })[0];

            if (!route) return callAgain();

            // Should now route summary contains 6 routes
            Object.keys(data.routes).length.should.eql(6);

            var c_rv = route.variances[0].spans.length;
            if (c_rv != 3 && c_rv != 4)
              return done(new Error('no transaction'));

            done();
          }
          else
            callAgain();
        });
      })()

      pm2.trigger('API', 'db1multi');
    });

    it.skip('should trigger inquisitor', function(done) {
      (function callAgain() {
        sub.once('message', function(data) {
          var packet = JSON.parse(data);
          if (!packet.data['axm:transaction:outlier']) return callAgain();
          var data = packet.data['axm:transaction:outlier'][0];
          data.meta.value.should.be.above(data.meta.percentiles[0.95]);
          data.process.name.should.be.eql('API');
          done();
        });
      })();

      pm2.trigger('API', 'Inquistor');
      setTimeout(function () {
        pm2.trigger('API', 'triggerInquisitor');
      }, 500);
    });

  });

});
