

var axm = require('..');
var should = require('should');

function forkCatch() {
  var app = require('child_process').fork(__dirname + '/fixtures/notify_catch_all.mock.js', [], {
    silent : true
  });
  return app;
}

function forkPromiseException() {
  var app = require('child_process').fork(__dirname + '/fixtures/promise_error.mock.js', [], {
    silent : true
  });
  return app;
}

function forkPromiseEmptyException() {
  var app = require('child_process').fork(__dirname + '/fixtures/promise_empty.js', [], {
    silent : true
  });
  return app;
}

function forkPromiseRejectError() {
  var app = require('child_process').fork(__dirname + '/fixtures/promise_reject_error.js', [], {
    silent : true
  });
  return app;
}

function forkPromiseExceptionRebind() {
  var app = require('child_process').fork(__dirname + '/fixtures/promise_error_bind.mock.js', [], {
    silent : true
  });
  return app;
}

function forkNotify() {
  var app = require('child_process').fork(__dirname + '/fixtures/notify.mock.js', []);
  return app;
}

describe('Notify exceptions', function() {
  it('should have the right properties', function(done) {
    axm.should.have.property('catchAll');
    axm.should.have.property('notify');
    axm.should.have.property('expressErrorHandler');
    done();
  });

  it('should process simple string error', function(done) {
    var ret = axm._interpretError('this is a message');
    should.exist(ret.stack);
    should.exist(ret.message);
    ret.message.should.eql('this is a message');
    done();
  });

  it('should process JSON object', function(done) {
    var ret = axm._interpretError({
      line : 'ok',
      env  : 'sisi'
    });

    should.exist(ret.stack);
    should.exist(ret.message);
    ret.stack.line.should.eql('ok');
    ret.stack.env.should.eql('sisi');
    done();
  });

  it('should process simple string', function(done) {
    var ret = axm._interpretError('Error');

    should.exist(ret.stack);
    should.exist(ret.message);

    done();
  });

  it('should process error', function(done) {
    var ret = axm._interpretError(new Error('error'));

    should.exist(ret.stack);
    should.exist(ret.message);
    done();
  });

  it('should catch unhandled promise', function(done) {
    if (process.version.indexOf('v0') > -1) return done()

    var app = forkPromiseException();

    app.once('message', function(data) {
      data.type.should.eql('axm:option:configuration');
      app.once('message', function(data) {
        data.type.should.eql('process:exception');
        data.data.message.should.eql('fail');
        process.kill(app.pid);
        done();
      });
    });
  });

  it('should catch empty unhandled promise', function(done) {
    if (process.version.indexOf('v0') > -1) return done()

    var app = forkPromiseEmptyException();

    app.once('message', function(data) {
      data.type.should.eql('axm:option:configuration');
      app.once('message', function(data) {
        data.type.should.eql('process:exception');
        data.data.message.should.eql('No error but unhandledRejection was caught!');
        process.kill(app.pid);
        done();
      });
    });
  });

  it('should catch unhandled promise', function(done) {
    if (process.version.indexOf('v0') > -1) return done()

    var app = forkPromiseRejectError();

    app.once('message', function(data) {
      data.type.should.eql('axm:option:configuration');
      app.once('message', function(data) {
        data.type.should.eql('process:exception');
        data.data.message.should.eql('ok');
        process.kill(app.pid);
        done();
      });
    });
  });

  it('should catch unhandled promise rebind', function(done) {
    if (process.version.indexOf('v0') > -1) return done()

    var app = forkPromiseExceptionRebind();

    app.once('message', function(data) {
      data.type.should.eql('axm:option:configuration');
      app.once('message', function(data) {
        data.type.should.eql('process:exception');
        data.data.message.should.eql('fail');
        process.kill(app.pid);
        done();
      });
    });
  });

  it('should catchAll exception in fork mode', function(done) {
    var app = forkCatch();

    app.once('message', function(data) {
      data.type.should.eql('axm:option:configuration');
      app.once('message', function(data) {
        should.exist(data.data.stackframes);
        should.exist(data.data.stackframes[0].file_name);
        should.exist(data.data.stackframes[0].line_number);
        data.type.should.eql('process:exception');
        data.data.message.should.eql('global error');
        process.kill(app.pid);
        done();
      });
    });
  });

  it('should notify process about error', function(done) {
    var app = forkNotify();

    app.once('message', function(data) {
      data.type.should.eql('process:exception');
      data.data.message.should.eql('hey');
      process.kill(app.pid);
      done();
    });
  });

});
