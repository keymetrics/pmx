
module.exports = function (pmx, tracer) {
  var latency;
  var throughput;

  tracer.on('mongo', function (data) {
    if (!latency) {
      latency = pmx.probe().histogram({
        name: 'Mongo: Response time',
        type: 'mongodb/latency',
        measurement: 'mean',
        unit: 'ms'
      });
    }
    if (!throughput) {
      throughput = pmx.probe().meter({
        name: 'Mongo: Throughput',
        samples: 60,
        type: 'mongodb/throughput',
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
