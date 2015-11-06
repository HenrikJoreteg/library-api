// This is a helper for writing tests with some
// logical defaults and simplified checks for looking
// for things like pagination, etc.
import assert from 'assert'
import server from '../server'
import Joi from 'joi'
import { pagination as paginationSchema } from '../data/validation'

export default (opts, done) => {
  const defaults = {
    method: 'GET',
    statusCode: 200,
    allowUnknown: true,
    bodyEmpty: false
  }

  // fill in defaults
  for (const item in defaults) {
    if (!opts.hasOwnProperty(item)) {
      opts[item] = defaults[item]
    }
  }

  if (opts.statusCode === 204) {
    opts.bodyEmpty = true
  }

  const injectConfig = {
    method: opts.method,
    url: opts.url
  }

  if (opts.payload) {
    injectConfig.payload = opts.payload
  }

  return new Promise((resolve) => {
    server.inject(injectConfig, (response) => {
      let parsed

      try {
        assert.doesNotThrow(() => {
          const { payload } = response
          if (payload) {
            parsed = JSON.parse(payload)
          } else if (!opts.bodyEmpty) {
            throw new Error('paylod body should not be empty')
          }
        }, 'gets a JSON parseable payload')

        if (opts.hasPagination) {
          const result = Joi.validate(parsed, paginationSchema, {allowUnknown: true})
          assert(!result.err, 'has pagination')
        } else if (parsed) {
          assert(!parsed.hasOwnProperty('limit'), 'should not have property: \'limit\'')
          assert(!parsed.hasOwnProperty('offset'), 'should not have property: \'offset\'')
        }

        if (opts.schema) {
          const result = Joi.validate(parsed, paginationSchema, {allowUnknown: opts.allowUnknown})
          assert(!result.err, `matches schema, response:\n${JSON.stringify(parsed, null, 2)}`)
        }

        assert.equal(response.statusCode, opts.statusCode, `status code is ${opts.statusCode}`)

        if (opts.test) {
          opts.test(parsed)
        }
      } catch (err) {
        console.log(`${injectConfig.method}: ${injectConfig.url}`)
        console.log(JSON.stringify(injectConfig, null, 2))

        console.log('RESPONSE:')
        console.log(JSON.stringify(parsed, null, 2))

        throw err
      }

      server.stop(() => {
        if (done) {
          done()
        } else {
          resolve()
        }
      })
    })
  })
}
