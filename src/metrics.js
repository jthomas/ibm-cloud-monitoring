// valid metric data points are in the following format
// { name: 'name', value: 012 }
const isValid = metric => exists(metric, 'name', 'string') && exists(metric, 'value', 'number')

const exists = (metric, name, type) => metric.hasOwnProperty(name) && typeof metric[name] === type

const parse = metrics => {
  if (!metrics) {
    throw new Error('metrics.parse() called with no valid metrics data')
  }

  const listOfMetrics = Array.isArray(metrics) ? metrics : [metrics]

  if (listOfMetrics.length <= 0) {
    throw new Error('metrics.parse() called with no valid metrics data')
  }

  const invalidMetrics = listOfMetrics.filter(metric => !isValid(metric))

  if (invalidMetrics.length > 0) {
    throw new Error(`metrics.parse() called with invalid metric value: ${JSON.stringify(invalidMetrics[0])}`)
  }

  return listOfMetrics
}

module.exports = { parse }
