
module.exports = function (pmx, tracer) {
  var latency;
  var throughput;

  tracer.on('redis', function (data) {
    if (!latency) {
      latency = pmx.probe().histogram({
        name: 'Redis: Response time',
        type: 'redis/latency',
        measurement: 'mean',
        unit: 'ms'
      });
    }

    if (!throughput) {
      throughput = pmx.probe().meter({
        name: 'Redis: Throughput',
        samples: 60,
        type: 'redis/throughput',
        unit: 'req/min'
      });
    }

    data = JSON.parse(data);
    throughput.mark();
    if (data.duration) {
      latency.update(data.duration);
    }
  });
};
