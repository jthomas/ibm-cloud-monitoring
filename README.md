# IBM Cloud Monitoring JavaScript SDK

BADGES?

JavaScript library for the [IBM Cloud Monitoring service](https://console.bluemix.net/docs/services/cloud-monitoring/monitoring_ov.html#monitoring_ov).

>  Use the IBM® Cloud Monitoring service to expand your collection and retention capabilities when working with metrics, and to be able to define rules and alerts that notify you of conditions that require attention. 

Provides a wrapper around the [HTTP APIs](https://console.bluemix.net/apidocs/927-ibm-cloud-monitoring-metrics-api?&language=node#introduction) for interacting with the service. 

Supports listing, retrieving and savings metrics from the IBM Cloud Monitoring service.

## usage

```javascript
const Monitoring = require('ibm-cloud-monitoring')
const client = new Monitoring({ scope: 's-XXX', api_key: 'API_KEY' })

// retrieve Node.js memory usage stats => { rss, heapTotal, heapUsed, external }                               
const memUsage = process.memoryUsage()

// metrics should use label name
const metricName = metric => `app.metric.${metric}`

// convert to memory usage stats to {key: '...', value: '...'}
const metrics = Object.entries(memUsage).map(
  entry => ({key: metricName(entry[0]), value: entry[1]})
)

await client.save(metrics)
```

This example saves the current memory usage statistics for a Node.js application to the IBM Cloud Monitoring Service.



## installation

```
npm install ibm-cloud-monitoring
```



## configuration

### host

The following [regional endpoints](https://console.bluemix.net/docs/services/cloud-monitoring/monitoring_ov.html#region) are available for the metrics service.

| Region   | Hostname                   |
| -------- | -------------------------- |
| US-South | metrics.ng.bluemix.net     |
| UK       | metrics.eu-gb.bluemix.net  |
| Germany  | metrics.eu-de.bluemix.net  |
| Sydney   | metrics.au-syd.bluemix.net |

### scope

`scope` must be the GUID for the space being monitored. 

Using the Bluemix CLI, the GUID for a space can be retrieved. 

```
$ bx iam space SpaceName --guid
667fadfc-jhtg-1234-9f0e-cf4123451095
```

**Space GUIDs must be prefixed with `s-` to identify a space in the `scope` parameter.**

Passing this GUID as the `scope` parameter would therefore use the following value.

```
s-667fadfc-jhtg-1234-9f0e-cf4123451095
```

### authentication

The monitoring service supports using one of the following authentication tokens.

- [UAA Token](https://console.bluemix.net/docs/services/cloud-monitoring/security/auth_uaa.html#auth_uaa)
- [IAM Token](https://console.bluemix.net/docs/services/cloud-monitoring/security/auth_iam.html#auth_iam)
- [API Key](https://console.bluemix.net/docs/services/cloud-monitoring/security/auth_api_key.html#auth_api_key)



## api

### constructor

```javascript
const Monitoring = require('ibm-cloud-monitoring')

const client = new Monitoring({
  host: 'metrics.ng.bluemix.net'
  scope: 's-<SPACE_GUID>',
  // plus one of the following auth parameters...
  api_key: 'API_KEY' // OR...
  iam_token: 'IAM_TOKEN' // OR...
  uaa_token: 'UAA_TOKEN'
})
```

The following constructor parameters are supported.

- `host` - [Host name](https://console.bluemix.net/docs/services/cloud-monitoring/monitoring_ov.html#region) for the IBM Cloud Monitoring service.
- `scope` - Scope identifier must be set to space GUID for monitoring instance.
- `api_key` - IBM Cloud API Key
- `iam_token` - IBM Cloud IAM token
- `uaa_token` - IBM Cloud UAA token

### methods

#### list metrics

```javascript
client.list()
client.list('metric.name.*')
```

***parameters***

The method takes a single string parameter for the metric query path to search. This value defaults to '*'.

***returns***

Promise with Array of metric labels from JSON response.

#### retrieve metrics

```javascript
client.retrieve({
  target: 'metric.name.*'
})
```

***parameters***

The method takes a single object parameter with values for the retrieval operation. 

This parameter must have a `target` property, containing metric labels to retrieve. It also supports the `from` and `until` properties to select the search time.

***returns***

Promise with Array of metrics and data points from JSON response.

#### save metrics

```javascript
// save single metric value
client.save({ name: 'metric.name.label', value: 0.05 })

// save multiple metric values
client.save([
  { name: 'metric.name.label', value: 0.05 },
  { name: 'metric.name.foo', value: 0.15 },
  { name: 'metric.name.bar', value: 0.25 }
])
```

***parameters***

This method takes a single parameter with metric values to save. Metric values must be an object with the `name` and `value` properties. An optional `timestamp` property is also supported on metric values.

Multiple metric values can be saved by passing in an array of metric values.

***returns***

Promise with no content to indicate when save operation has finished.



## bugs / feedback / issues?

Please open issues in the open-source repository on Github if you have problems.
