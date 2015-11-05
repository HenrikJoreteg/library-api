import Boom from 'boom'
import { pagination, newAuthor, authorUpdate, id } from '../data/validation'
import db, { resolveOr404 } from '../db-connection'

const register = function (server, options, next) {
  server.route({
    method: 'GET',
    path: '/authors',
    config: {
      description: 'Fetch all authors',
      tags: ['paginated', 'list'],
      auth: false,
      handler (request, reply) {
        reply(db.select()
          .table('authors')
          .limit(request.query.limit)
          .offset(request.query.offset))
      },
      validate: {
        query: pagination
      }
    }
  })

  server.route({
    method: 'POST',
    path: '/authors',
    config: {
      description: 'Create a new author',
      tags: ['admin'],
      auth: {
        scope: 'librarian'
      },
      handler (request, reply) {
        const query = db('authors').insert(request.payload)

        query.then((result) => {
          const getQuery = db('authors').where({id: result[0]})
          reply(resolveOr404(getQuery)).code(201)
        })
        .catch(reply)
      },
      validate: {
        payload: newAuthor
      }
    }
  })

  server.route({
    method: 'DELETE',
    path: '/authors/{id}',
    config: {
      description: 'Delete a author',
      tags: ['admin'],
      auth: {
        scope: 'librarian'
      },
      handler (request, reply) {
        const query = db('authors')
          .where({id: request.params.id})
          .del()

        const response = query.then((result) => {
          if (result === 0) {
            return Boom.notFound(`Author id ${request.params.id} not found`)
          } else {
            return request.generateResponse().code(204)
          }
        })

        reply(response)
      },
      validate: {
        params: {id}
      }
    }
  })

  server.route({
    method: 'PUT',
    path: '/authors/{id}',
    config: {
      description: 'Edit author details',
      tags: ['admin'],
      auth: {
        scope: 'librarian'
      },
      handler (request, reply) {
        reply(db('authors')
          .where({id: request.params.id})
          .update(request.payload))
      },
      validate: {
        payload: authorUpdate,
        params: {id}
      }
    }
  })

  server.route({
    method: 'GET',
    path: '/authors/{id}',
    config: {
      description: 'Fetch details about a single author',
      tags: ['detail'],
      auth: false,
      handler (request, reply) {
        const query = db('authors')
          .select()
          .where({id: request.params.id})

        reply(resolveOr404(query, 'author'))
      },
      validate: {
        params: {id}
      }
    }
  })

  next()
}

register.attributes = {
  name: 'authors',
  version: '1.0.0'
}

export default { register }
