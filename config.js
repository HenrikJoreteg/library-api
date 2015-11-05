/*eslint no-var: 0, global-require: 0*/
// require this to retrieve any needed config items
// provide an environment specific JSON file in the
// `config` directory named according to the
// `NODE_ENV` it is running in.
//
// This module will:
// 1. Require the correct JSON file based on the
//    `NODE_ENV` it is running in (defaults to 'development')
// 2. Attempt to populate any values in the required config
//    that start with a `$`, are uppercase, and are alphanumeric
//    with corresponding environment variables. It will throw
//    an error if no such environment varible exists.
//    See below for exact regex used to determine if a value
//    should be considered a variable that needs to be populated.
var envRE = /^\$[A-Z0-9_]+$/
var env = process.env.NODE_ENV || 'development'
var config
var configPath = `${__dirname}/config/${env}.json`

// try to find a module with name corresponding to environment.
try {
  config = require(configPath)
} catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    throw new Error(`Unable to find a config at path: ${configPath}`)
  } else {
    throw e
  }
}

// walk the structure, filling in any environment variables
var fillInEnvironmentVariables = function (obj) {
  var value
  var envVar

  for (var item in obj) {
    value = obj[item]
    // if it looks like an environment variable
    // fill it in from process.env
    if (typeof value === 'string' && envRE.test(value)) {
      // slice off the dollar sign
      envVar = process.env[value.slice(1)]
      if (!envVar) {
        throw new Error(`Failed to find environment variable ${value.slice(1)}`)
      }
      obj[item] = envVar
    } else if (typeof value === 'object') {
      fillInEnvironmentVariables(value)
    }
  }
}

fillInEnvironmentVariables(config)

module.exports = config
