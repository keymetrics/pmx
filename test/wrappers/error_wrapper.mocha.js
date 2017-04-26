
var should = require('should');

describe('ERROR Wrapper', function() {
  var app;
  var __original_error = Error;

  require('../../lib/wrapper/error_wrapper.js')();

  it('should wrapped error be an error', function() {
    should(typeof(new Error('toto'))).eql(typeof(new __original_error('toto')));
  });

  it('should have stack', function() {
    should(new Error('lolilol').stack);
  });

  it('should Error', function() {
    Error('asddsa');
  });

  it('should error_rate exists', function() {
    should.exists(global.__km_error_rate);
  });

  it('should error_rate exists', function(done) {
    this.timeout(20000);

    for (var i = 0; i < 9000; i++)
      new Error('toto');

    console.log('Waiting for tickInterval to be triggered');
    setTimeout(function() {
      should(global.__km_error_rate.val()).be.above(0);
      done();
    }, 5000);
  });

});
