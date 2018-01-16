
var axm = require('../..');
axm.init()

var probe = axm.probe();


/**
 * Meter for HTTP
 */
var meter = probe.meter({
    name    : 'req/min',
    agg_type: 'min',
    seconds : 60
});

var http  = require('http');

http.createServer(function(req, res) {
    meter.mark();
    res.end('Thanks');
}).listen(3400);
