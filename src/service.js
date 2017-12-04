const querystring = require('querystring')

const API_PATH = `/v1/metrics`

const url = (host, options = {}) => {
  let url = `https://${host}${API_PATH}${options.path || ''}`
  if (options.qs) {
    url = `${url}?${querystring.stringify(options.qs)}`
  }

  return url
}

module.exports = { url }
