const auth = require('./auth')
const metrics = require('./metrics')
const service = require('./service')
const fetch = require('node-fetch')

const API_PATH = `/v1/metrics`

class Monitoring {
  constructor (params) {
    this.storeConfigParam('scope', params)
    this.storeConfigParam('host', params)
    this.token = auth.token(params)
  }

  save (data) {
    const listOfMetrics = metrics.parse(data)

    const url = service.url(this.host)
    const options = {
      method: 'POST',
      body: JSON.stringify(listOfMetrics),
      headers: auth.headers(this.scope, this.token)
    }

    return this.fetch(url, options)
  }

  retrieve (qs = {}) {
    if (!qs.hasOwnProperty('target')) {
      throw new Error('retrieve() called without target parameter')
    }

    const url = service.url(this.host, { qs })
    const options = {
      headers: auth.headers(this.scope, this.token)
    }

    return this.fetch(url, options).then(res => res.json())
  }

  list (query = '*') {
    const url = service.url(this.host, {
      path: '/list',
      qs: { query }
    })

    const options = {
      headers: auth.headers(this.scope, this.token)
    }

    return this.fetch(url, options).then(res => res.json())
  }

  storeConfigParam (name, params) {
   if (!params) {
      throw new Error('Missing mandatory constructor parameters')
    }

    if (!params.hasOwnProperty(name)) {
      throw new Error(`Missing mandatory constructor parameter: ${name}`)
    }

    this[name] = params[name]
  }

  fetch (url, options) {
    // if HTTP error code received,
    // return failed promise with error message from response body
    return this._fetch(url, options)
      .then(async res => res.ok ? res : Promise.reject(await res.json()))
  }

  // wrap http client to make unit testing easier.
  _fetch (url, options) {
    return fetch(url, options)
  }
}
module.exports = Monitoring
