

var pmx = require('..');

function forkAppClassic() {
  var app = require('child_process').fork(__dirname + '/proc.mock.js', []);
  return app;
}

function forkAppWithOptions() {
  var app = require('child_process').fork(__dirname + '/proc-option.mock.js', []);
  return app;
}

describe('Action module', function() {

  describe('Action without option', function() {
    var app;
    var action_name;

    after(function() {
      process.kill(app.pid);
    });

    it('should notify PM2 of a new action available', function(done) {
      app = forkAppClassic();

      app.once('message', function(dt) {
        dt.type.should.eql('axm:action');
        dt.data.action_name.should.eql('test:nab');
        dt.data.opts.comment.should.eql('This is a test');
        dt.data.opts.display.should.eql(true);

        action_name = dt.data.action_name;

        done();
      });
    });

    it('should trigger the action', function(done) {
      app.once('message', function(dt) {
        dt.type.should.eql('axm:reply');
        dt.data.return.res.should.eql('hello moto');
        done();
      });

      app.send(action_name);
    });

    it('should trigger the action via Object arity 1 (FALLBACK)', function(done) {
      app.once('message', function(dt) {
        dt.type.should.eql('axm:reply');
        dt.data.return.res.should.eql('hello moto');
        done();
      });

      app.send({msg : action_name, opts : { sisi : 'true' }});
    });

    it('should not trigger the action if wrong action name', function(done) {
      app.once('message', function(dt) {
        throw new Error('Should not be called');
      });

      app.send({
        action_name : 'im unknown'
      });

      setTimeout(done, 200);
    });
  });

  describe('Action with extra options (parameters)', function() {
    var app;
    var action_name;

    after(function() {
      process.kill(app.pid);
    });

    it('should notify PM2 of a new action available', function(done) {
      app = forkAppWithOptions();

      app.once('message', function(dt) {
        dt.type.should.eql('axm:action');
        dt.data.action_name.should.eql('test:with:options');
        action_name = dt.data.action_name;
        done();
      });
    });

    it('should trigger the action without failing (2 args without option)', function(done) {
      app.once('message', function(dt) {
        dt.type.should.eql('axm:reply');
        dt.data.return.res.should.eql('hello moto');
        done();
      });

      app.send(action_name);
    });

    it('should trigger the action', function(done) {
      app.once('message', function(dt) {
        dt.type.should.eql('axm:reply');
        dt.data.return.res.should.eql('hello moto');
        dt.data.return.options.f1.should.eql('ab');
        done();
      });

      app.send({ msg : action_name, opts : { f1 : 'ab', f2 : 'cd'}});
    });

    it('should not trigger the action if wrong action name', function(done) {
      app.once('message', function(dt) {
        throw new Error('Should not be called');
      });

      app.send('im unknown');

      setTimeout(done, 200);
    });

  });


});
