
module.exports = function (pmx, tracer) {
  var latency = pmx.probe().histogram({
    name: 'HTTP out: Response time',
    type: 'http/outbound/latency',
    measurement: 'mean',
    unit: 'ms'
  })

  var throughput = pmx.probe().meter({
    name: 'HTTP out: Throughput',
    samples: 60,
    type: 'http/outbound/throughput',
    unit: 'req/min'
  })

  tracer.on('http-outbound', function (data) {
    data = JSON.parse(data)
    throughput.mark()
    if (data.duration) {
      latency.update(data.duration)
    }
  })

  tracer.on('https-outbound', function (data) {
    data = JSON.parse(data)
    throughput.mark()
    if (data.duration) {
      latency.update(data.duration)
    }
  })
}
