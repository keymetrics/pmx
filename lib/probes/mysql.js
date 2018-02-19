
module.exports = function (pmx, tracer) {
  var latency;
  var throughput;

  tracer.on('mysql', function (data) {
    if (!latency) {
      latency = pmx.probe().histogram({
        name: 'MYSQL: Response time',
        type: 'mysql/latency',
        measurement: 'mean',
        unit: 'ms'
      });
    }

    if (!throughput) {
      throughput = pmx.probe().meter({
        name: 'MYSQL: Throughput',
        samples: 60,
        type: 'mysql/throughput',
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
