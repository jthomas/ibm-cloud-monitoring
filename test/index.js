import test from 'ava';
import Monitoring from '../'

test('should set up authentication headers from constructor parameters', t => {
  let client = new Monitoring({
    scope: 'scope',
    api_key: 'token',
    host: 'host'
  })

  t.is(client.scope, 'scope')
  t.is(client.host, 'host')
  t.is(client.token, 'apikey token')

  client = new Monitoring({
    scope: 'scope',
    iam_token: 'token',
    host: 'host'
  })

  t.is(client.scope, 'scope')
  t.is(client.token, 'iam token')
  t.is(client.host, 'host')

  client = new Monitoring({
    scope: 'scope',
    uaa_token: 'token',
    host: 'host'
  })

  t.is(client.scope, 'scope')
  t.is(client.token, 'uaa token')
  t.is(client.host, 'host')
})

test('should throw error when missing mandatory constructor parameters', t => {
  t.throws(() => {
    const client = new Monitoring()
  }, 'Missing mandatory constructor parameters')

  t.throws(() => {
    const client = new Monitoring({
      scope: 'scope',
      api_key: 'hello'
    })
  }, 'Missing mandatory constructor parameter: host')


  t.throws(() => {
    const client = new Monitoring({
      host: 'host',
      api_key: 'hello'
    })
  }, 'Missing mandatory constructor parameter: scope')

  t.throws(() => {
    const client = new Monitoring({
      scope: 'hello',
      host: 'host'
    })
  }, 'Missing mandatory authentication parameter: api_key, uaa_token or iam_token')

  t.throws(() => {
    const client = new Monitoring({
      scope: 'scope',
      host: 'host',
      uaa_token: 'hello',
      api_key: 'hello'
    })
  }, 'Passed multiple conflicting authentication parameters')
})

test('should throw error when missing metrics to save', t => {
  let client = new Monitoring({
    scope: 'scope',
    api_key: 'token',
    host: 'host'
  })

  t.throws(() => {
    client.save()
  }, 'metrics.parse() called with no valid metrics data')

  t.throws(() => {
    client.save([])
  }, 'metrics.parse() called with no valid metrics data')
})

test('should throw error when metrics are invalid', t => {
  let client = new Monitoring({
    scope: 'scope',
    api_key: 'token',
    host: 'host'
  })

  // missing name & value parameters
  t.throws(() => {
    client.save({})
  }, 'metrics.parse() called with invalid metric value: {}')

  t.throws(() => {
    client.save({a: 1, b: 2})
  }, 'metrics.parse() called with invalid metric value: {"a":1,"b":2}')

  t.throws(() => {
    client.save({name: 'hello'})
  }, 'metrics.parse() called with invalid metric value: {"name":"hello"}')

  t.throws(() => {
    client.save({value: 'hello'})
  }, 'metrics.parse() called with invalid metric value: {"value":"hello"}')

  t.throws(() => {
    client.save([{a: 1, b: 2}])
  }, 'metrics.parse() called with invalid metric value: {"a":1,"b":2}')

  t.throws(() => {
    client.save([{name: 'hello', value: 1}, {a: 1, b: 2}])
  }, 'metrics.parse() called with invalid metric value: {"a":1,"b":2}')


  // name & value must be correct type
  t.throws(() => {
    client.save({name: 'hello', value: 'hello'})
  }, 'metrics.parse() called with invalid metric value: {"name":"hello","value":"hello"}')

  // name & value must be correct type
  t.throws(() => {
    client.save({name: 1, value: 'hello'})
  }, 'metrics.parse() called with invalid metric value: {"name":1,"value":"hello"}')
})

test('should throw error when retrieving metrics without target', t => {
  let client = new Monitoring({
    scope: 'scope',
    api_key: 'token',
    host: 'host'
  })

  t.throws(() => {
    client.retrieve()
  }, 'retrieve() called without target parameter')

  t.throws(() => {
    client.retrieve({})
  }, 'retrieve() called without target parameter')
})

test('should retrieve metrics from monitoring service without time parameters', async t => {
  let client = new Monitoring({
    scope: 'scope',
    api_key: 'token',
    host: `metrics.ng.bluemix.net`
  })

  t.plan(3)
  client._fetch = (url, options) => {
    t.is(url, `https://metrics.ng.bluemix.net/v1/metrics?target=metric.name`)
    t.deepEqual(options, {
      headers: {
        'X-Auth-Scope-Id': 'scope',
        'X-Auth-User-Token': 'apikey token'
      }
    })
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([{a: 1, b: 2, c: 3}])
    })
  }

  let result = await client.retrieve({target: 'metric.name'})
  t.deepEqual(result, [{a: 1 , b: 2, c: 3}])
})

test('should retrieve metrics from monitoring service with time parameters', async t => {
  let client = new Monitoring({
    scope: 'scope',
    api_key: 'token',
    host: `metrics.ng.bluemix.net`
  })

  t.plan(3)
  client._fetch = (url, options) => {
    t.is(url, `https://metrics.ng.bluemix.net/v1/metrics?target=metric.name&from=-24H&until=now`)
    t.deepEqual(options, {
      headers: {
        'X-Auth-Scope-Id': 'scope',
        'X-Auth-User-Token': 'apikey token'
      }
    })
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([{a: 1, b: 2, c: 3}])
    })
  }

  let result = await client.retrieve({target: 'metric.name', from: '-24H', until: 'now'})
  t.deepEqual(result, [{a: 1 , b: 2, c: 3}])
})

test('should list metrics from monitoring service', async t => {
  let client = new Monitoring({
    scope: 'scope',
    api_key: 'token',
    host: `metrics.ng.bluemix.net`
  })

  t.plan(3)
  client._fetch = (url, options) => {
    t.is(url, `https://metrics.ng.bluemix.net/v1/metrics/list?query=*`)
    t.deepEqual(options, {
      headers: {
        'X-Auth-Scope-Id': 'scope',
        'X-Auth-User-Token': 'apikey token'
      }
    })
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([{a: 1, b: 2, c: 3}])
    })
  }

  let result = await client.list()
  t.deepEqual(result, [{a: 1 , b: 2, c: 3}])
})

test('should list metrics with custom query from monitoring service', async t => {
  let client = new Monitoring({
    scope: 'scope',
    api_key: 'token',
    host: `metrics.ng.bluemix.net`
  })

  t.plan(3)
  client._fetch = (url, options) => {
    t.is(url, `https://metrics.ng.bluemix.net/v1/metrics/list?query=metric.name.*`)
    t.deepEqual(options, {
      headers: {
        'X-Auth-Scope-Id': 'scope',
        'X-Auth-User-Token': 'apikey token'
      }
    })
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([{a: 1, b: 2, c: 3}])
    })
  }

  let result = await client.list('metric.name.*')
  t.deepEqual(result, [{a: 1 , b: 2, c: 3}])
})

test('should save single metric to monitoring service', async t => {
  let client = new Monitoring({
    scope: 'scope',
    api_key: 'token',
    host: `metrics.ng.bluemix.net`
  })

  t.plan(4)
  client._fetch = (url, options) => {
    t.is(url, `https://metrics.ng.bluemix.net/v1/metrics`)
    t.deepEqual(options, {
      method: 'POST',
      body: JSON.stringify([{name: "metric.name.label", value: 0.05}]),
      headers: {
        'X-Auth-Scope-Id': 'scope',
        'X-Auth-User-Token': 'apikey token'
      }
    })
    return Promise.resolve({ok: true})
  }

  let result = await client.save({name: 'metric.name.label', value: 0.05})
  result = await client.save([{name: 'metric.name.label', value: 0.05}])
})

test('should return errors from metrics service', async t => {
  let client = new Monitoring({
    scope: 'scope',
    api_key: 'token',
    host: `metrics.ng.bluemix.net`
  })

  const errMsg = { errors: [ { code: 'BXNMSRI01E', message: 'Token is expired' } ] }
  t.plan(3)
  client._fetch = (url, options) => {
    return Promise.resolve({
      ok: false,
      json: () => Promise.resolve(errMsg)
    })
  }

  try {
    await client.save([ {name: 'metric.c.label', value: 3.05} ])
  } catch (res) {
    t.deepEqual(res, errMsg)
  }

  try {
    await client.list()
  } catch (res) {
    t.deepEqual(res, errMsg)
  }

  try {
    await client.retrieve({target: 'metric.name'})
  } catch (res) {
    t.deepEqual(res, errMsg)
  }

})

test('should save multiple metrics to monitoring service', async t => {
  let client = new Monitoring({
    scope: 'scope',
    api_key: 'token',
    host: `metrics.ng.bluemix.net`
  })

  t.plan(2)
  client._fetch = (url, options) => {
    t.is(url, `https://metrics.ng.bluemix.net/v1/metrics`)
    t.deepEqual(options, {
      method: 'POST',
      body: JSON.stringify([
        {name: "metric.a.label", value: 1.05},
        {name: "metric.b.label", value: 2.05},
        {name: "metric.c.label", value: 3.05}
      ]),
      headers: {
        'X-Auth-Scope-Id': 'scope',
        'X-Auth-User-Token': 'apikey token'
      }
    })
    return Promise.resolve({ok: true})
  }

  const result = await client.save([
    {name: 'metric.a.label', value: 1.05},
    {name: 'metric.b.label', value: 2.05},
    {name: 'metric.c.label', value: 3.05}
  ])
})
