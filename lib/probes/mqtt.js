
module.exports = function (pmx, tracer) {
  var latency;
  var throughput;

  tracer.on('mqtt', function (data) {
    if (!latency) {
      latency = pmx.probe().histogram({
        name: 'MQTT: Response time',
        type: 'mqtt/latency',
        measurement: 'mean',
        unit: 'ms'
      });
    }

    if (!throughput) {
      throughput = pmx.probe().meter({
        name: 'MQTT: Throughput',
        samples: 60,
        type: 'mqtt/throughput',
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
