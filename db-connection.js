import knex from 'knex'
import Boom from 'boom'
import { db } from './config'

const client = knex(db)

export default client

export const resolveOr404 = (promise, label = 'resource') => {
  return promise.then((rows) => {
    if (rows.length === 0) {
      throw Boom.notFound(`no such ${label}`)
    } else {
      return rows[0]
    }
  })
}
