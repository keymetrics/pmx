
module.exports = function (pmx, tracer) {
  var latency;
  var throughput;
  var latencyHTTPS;
  var throughputHTTPS;

  tracer.on('http-outbound', function (data) {
    if (!latency) {
      latency = pmx.probe().histogram({
        name: 'HTTP out: Response time',
        type: 'http/outbound/latency',
        measurement: 'mean',
        unit: 'ms'
      });
    }
    if (!throughput) {
      throughput = pmx.probe().meter({
        name: 'HTTP out: Throughput',
        samples: 60,
        type: 'http/outbound/throughput',
        unit: 'req/min'
      });
    }

    data = JSON.parse(data);
    throughput.mark();
    if (data.duration) {
      latency.update(data.duration);
    }
  });

  tracer.on('https-outbound', function (data) {
    if (!latencyHTTPS) {
      latencyHTTPS = pmx.probe().histogram({
        name: 'HTTPS out: Response time',
        type: 'https/outbound/latency',
        measurement: 'mean',
        unit: 'ms'
      });
    }
    if (!throughputHTTPS) {
      throughputHTTPS = pmx.probe().meter({
        name: 'HTTPS out: Throughput',
        samples: 60,
        type: 'https/outbound/throughput',
        unit: 'req/min'
      });
    }

    data = JSON.parse(data);
    throughputHTTPS.mark();
    if (data.duration) {
      latencyHTTPS.update(data.duration);
    }
  });
};
