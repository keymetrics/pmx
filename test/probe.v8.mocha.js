var axm = require('..');

function fork(script) {
    var app = require('child_process').fork(__dirname + (script || '/fixtures/probe.v8.fixture.js'), []);
    return app;
}

function forkNoV8(script) {
    var app = require('child_process').fork(__dirname + (script || '/fixtures/probe.v8disabled.fixture.js'), []);
    return app;
}


describe('Probe V8', function () {

    it('should fork app and doest\'t receive data from v8 probes (v8 disabled)', function (done) {
        var app = fork();

        app.on('message', function (pck) {

            if (pck.type === 'axm:monitor') {

                pck.data.should.have.property('New space used size').not.be.true();
                pck.data.should.have.property('Old space used size').not.be.true();
                pck.data.should.have.property('Map space used size').not.be.true();
                pck.data.should.have.property('Code space used size').not.be.true();
                pck.data.should.have.property('Large object space used size').not.be.true();

                app.kill();
                done();
            }
        });
    });

    it('should fork app and receive data from v8 probes', function (done) {
        var app = fork();

        app.on('message', function (pck) {

            if (pck.type === 'axm:monitor') {

                pck.data.should.have.property('New space used size');
                pck.data.should.have.property('Old space used size');
                pck.data.should.have.property('Map space used size');
                pck.data.should.have.property('Code space used size');
                pck.data.should.have.property('Large object space used size');

                Number.isInteger(pck.data['New space used size'].value).should.be.true();
                Number.isInteger(pck.data['Old space used size'].value).should.be.true();
                Number.isInteger(pck.data['Map space used size'].value).should.be.true();
                Number.isInteger(pck.data['Code space used size'].value).should.be.true();
                Number.isInteger(pck.data['Large object space used size'].value).should.be.true();

                app.kill();
                done();
            }
        });
    });

})
