import { pagination, id } from '../data/validation'
import db, { resolveOr404 } from '../db-connection'

const register = function (server, options, next) {
  server.route({
    method: 'GET',
    path: '/users',
    config: {
      description: 'Fetch all users',
      tags: ['paginated', 'list'],
      auth: {
        strategy: 'session',
        scope: 'librarian'
      },
      handler (request, reply) {
        reply(db.select()
          .table('users')
          .limit(request.query.limit)
          .offset(request.query.offset))
      },
      validate: {
        query: pagination
      }
    }
  })

  server.route({
    method: 'GET',
    path: '/users/{userId}',
    config: {
      description: 'Fetch details about a single user',
      tags: ['detail'],
      auth: {
        strategy: 'session',
        scope: 'librarian'
      },
      handler (request, reply) {
        const { userId } = request.params
        const query = db('users')
          .select()
          .where({id: userId})

        reply(resolveOr404(query, 'user'))
      },
      validate: {
        params: {
          userId: id
        }
      }
    }
  })

  next()
}

register.attributes = {
  name: 'users',
  version: '1.0.0'
}

export default { register }
