
module.exports = function (pmx, tracer) {
  var latency = pmx.probe().histogram({
    name: 'MQTT: Response time',
    type: 'mqtt/latency',
    measurement: 'mean',
    unit: 'ms'
  })

  var throughput = pmx.probe().meter({
    name: 'MQTT: Throughput',
    samples: 60,
    type: 'mqtt/throughput',
    unit: 'req/min'
  })

  tracer.on('mqtt', function (data) {
    data = JSON.parse(data)
    throughput.mark()
    if (data.duration) {
      latency.update(data.duration)
    }
  })
}
