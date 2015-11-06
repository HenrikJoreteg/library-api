/*eslint no-var: 0*/
// our config module already handles pulling in correct variables
// based on environment so we can simply require our config
// and reference the `db` entry for each one. We do this because
// when you use the knex CLI and pass a `NODE_ENV` environment
// variable it expects a corresponding key to exist.
var environmentAwareDbConfig = require('./config').db

module.exports = {
  development: environmentAwareDbConfig,
  staging: environmentAwareDbConfig,
  production: environmentAwareDbConfig,
  test: environmentAwareDbConfig
}
