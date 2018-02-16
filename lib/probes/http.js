
module.exports = function (pmx, tracer) {
  var latency;
  var throughput;
  var latencyHTTPS;
  var throughputHTTPS;

  tracer.on('http', function (data) {
    latency = pmx.probe().histogram({
      name: 'HTTP: Response time',
      type: 'http/inbound/latency',
      measurement: 'mean',
      unit: 'ms'
    });

    throughput = pmx.probe().meter({
      name: 'HTTP: Throughput',
      samples: 60,
      type: 'http/inbound/throughput',
      unit: 'req/min'
    });

    data = JSON.parse(data);
    throughput.mark();
    if (data.duration) {
      latency.update(data.duration);
    }
  });

  tracer.on('https', function (data) {
    latencyHTTPS = pmx.probe().histogram({
      name: 'HTTPS: Response time',
      type: 'https/inbound/latency',
      measurement: 'mean',
      unit: 'ms'
    });

    throughputHTTPS = pmx.probe().meter({
      name: 'HTTPS: Throughput',
      samples: 60,
      type: 'https/inbound/throughput',
      unit: 'req/min'
    });

    data = JSON.parse(data);
    throughputHTTPS.mark();
    if (data.duration) {
      latencyHTTPS.update(data.duration);
    }
  });
};
