const AUTH_SCHEMES = new Map([
  ['api_key', 'apikey'],
  ['iam_token', 'iam'],
  ['uaa_token', 'uaa']
])

const validAuthParams = params => [...AUTH_SCHEMES.keys()].filter(key => params.hasOwnProperty(key))

const formatToken = (name, value) => `${AUTH_SCHEMES.get(name)} ${value}`

const token = (params) => {
  const authParams = validAuthParams(params)
  const numOfAuthParams = authParams.length

  if (numOfAuthParams === 0) {
    throw new Error('Missing mandatory authentication parameter: api_key, uaa_token or iam_token')
  }

  if (numOfAuthParams > 1) {
    throw new Error('Passed multiple conflicting authentication parameters')
  }

  const tokenName = authParams[0]
  const tokenValue = params[tokenName]

  return formatToken(tokenName, tokenValue)
}

const headers = (scope, token) => ({
  'X-Auth-Scope-Id': scope,
  'X-Auth-User-Token': token
})

module.exports = { token, headers }
