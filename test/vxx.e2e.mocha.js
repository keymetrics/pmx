
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

        pm2.kill(function() {
          pm2.connect(function() {
            done();
          });
        });
      });
    });
  });

  after(function(done) {
    pm2.kill(done);
  });

  describe('application testing', function() {
    afterEach(function() {
      //console.log(sub);
      //sub.unsubscribe();
    });

    it('should start test application', function(done) {
      sub.once('message', function(data) {
        var packet = JSON.parse(data);
        packet.data['process:event'].length.should.eql(2)
        done();
      });

      pm2.start({
        script : 'app.js',
        name   : 'API'
      }, function(err, data) {

      });
    });

    it('should get transaction trace via interactor output', function(done) {
      (function callAgain() {
        sub.once('message', function(data) {
          var packet = JSON.parse(data);

          if (packet.data['axm:transaction']) {

            // Only one app
            packet.data['axm:transaction'].length.should.eql(1);

            // Should only find 3 different routes
            Object.keys(packet.data['axm:transaction'][0].data.routes).length.should.eql(3);

            var route = packet.data['axm:transaction'][0].data.routes['/'][0];

            // Right property keys
            route.should.have.properties(['min', 'max', 'mean', 'meter', 'count', 'spans']);
            done();
          }
          else callAgain();
        });
      })()

      pm2.triggerCustomAction('API', 'launchMock');
    });

    it('should get database transaction trace (save)', function(done) {
      (function callAgain() {
        sub.once('message', function(data) {
          var packet = JSON.parse(data);

          if (packet.data['axm:transaction']) {
            // Should now route summary contains 4 routes
            Object.keys(packet.data['axm:transaction'][0].data.routes).length.should.eql(4);
            // @question: Why extra .spans at the end?
            var tracing = packet.data['axm:transaction'][0].data.routes['/db1/save'][0].spans;
            // Should count 10 transactions
            packet.data['axm:transaction'][0].data.routes['/db1/save'][0].count.should.eql(10);
            //console.log(packet.data['axm:transaction'][0].data.routes['/db1/save']);
            tracing.child.length.should.eql(1);
            tracing.child[0].name.should.eql('mongo-insert');
            done();
          }
          else
            callAgain();
        });
      })()

      pm2.triggerCustomAction('API', 'launchQueryToDbRoutes');
    });

    it('should get simple database transaction trace (find)', function(done) {
      (function callAgain() {
        sub.once('message', function(data) {
          var packet = JSON.parse(data);

          if (packet.data['axm:transaction']) {
            // Should now route summary contains 5 routes
            Object.keys(packet.data['axm:transaction'][0].data.routes).length.should.eql(5);

            // @bug: should contain only 1 transaction not 2 (only find)
            packet.data['axm:transaction'][0].data.routes['/db1/get'][0].spans.child.length.should.eql(2);

            done();
          }
          else
            callAgain();
        });
      })()

      pm2.triggerCustomAction('API', 'db1get');
    });

    it('should get multi database transaction trace (find + findOne)', function(done) {
      (function callAgain() {
        sub.once('message', function(data) {
          var packet = JSON.parse(data);

          if (packet.data['axm:transaction']) {
            // Should now route summary contains 5 routes
            Object.keys(packet.data['axm:transaction'][0].data.routes).length.should.eql(6);

            // @bug: should contain only 2 transactions not 3 (find + findOne)
            packet.data['axm:transaction'][0].data.routes['/db1/multi'][0].spans.child.length.should.eql(3);

            done();
          }
          else
            callAgain();
        });
      })()

      pm2.triggerCustomAction('API', 'db1multi');
    });


  });

});
