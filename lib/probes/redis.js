
module.exports = function (pmx, tracer) {
  var latency = pmx.probe().histogram({
    name: 'Redis: Response time',
    type: 'redis/latency',
    measurement: 'mean',
    unit: 'ms'
  })

  var throughput = pmx.probe().meter({
    name: 'Redis: Throughput',
    samples: 60,
    type: 'redis/throughput',
    unit: 'req/min'
  })

  tracer.on('redis', function (data) {
    data = JSON.parse(data)
    throughput.mark()
    if (data.duration) {
      latency.update(data.duration)
    }
  })
}
