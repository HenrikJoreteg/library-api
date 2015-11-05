import Boom from 'boom'
import { pagination, newBook, bookUpdate, id } from '../data/validation'
import db, { resolveOr404 } from '../db-connection'
import ms from 'milliseconds'

const register = function (server, options, next) {
  server.route({
    method: 'GET',
    path: '/books',
    config: {
      description: 'Fetch all books',
      tags: ['paginated', 'list'],
      auth: false,
      handler (request, reply) {
        reply(db.select()
          .table('books')
          .limit(request.query.limit)
          .offset(request.query.offset)
          .orderBy('title', 'asc'))
      },
      validate: {
        query: pagination
      }
    }
  })

  server.route({
    method: 'POST',
    path: '/books',
    config: {
      description: 'Create a new book',
      tags: ['admin'],
      auth: {
        strategy: 'session',
        scope: 'librarian'
      },
      handler (request, reply) {
        const query = db('books').insert(request.payload)

        query.then((result) => {
          const getQuery = db('books').where({id: result[0]})
          reply(resolveOr404(getQuery)).code(201)
        })
        .catch((err) => {
          reply(err)
        })
      },
      validate: {
        payload: newBook
      }
    }
  })

  server.route({
    method: 'DELETE',
    path: '/books/{bookId}',
    config: {
      description: 'Delete a book',
      tags: ['admin'],
      auth: {
        strategy: 'session',
        scope: 'librarian'
      },
      handler (request, reply) {
        const { bookId } = request.params
        const query = db('books')
          .where({id: bookId})
          .del()

        const response = query.then((result) => {
          if (result === 0) {
            return Boom.notFound(`Book id ${bookId} not found`)
          } else {
            return request.generateResponse().code(204)
          }
        })

        reply(response)
      },
      validate: {
        params: {
          bookId: id
        }
      }
    }
  })

  server.route({
    method: 'PUT',
    path: '/books/{bookId}',
    config: {
      description: 'Edit book details',
      tags: ['admin'],
      auth: {
        strategy: 'session',
        scope: 'librarian'
      },
      handler (request, reply) {
        const { bookId } = request.params
        reply(db('books')
          .where({id: bookId})
          .update(request.payload))
      },
      validate: {
        payload: bookUpdate,
        params: {
          bookId: id
        }
      }
    }
  })

  server.route({
    method: 'GET',
    path: '/books/{bookId}',
    config: {
      description: 'Fetch details about a single book',
      tags: ['detail'],
      auth: false,
      handler (request, reply) {
        const { bookId } = request.params
        const query = db('books')
          .select()
          .where({id: bookId})

        reply(resolveOr404(query, 'book'))
      },
      validate: {
        params: {
          bookId: id
        }
      }
    }
  })

  server.route({
    method: 'POST',
    path: '/books/{bookId}/checkout',
    config: {
      description: 'Check out a book',
      tags: ['action'],
      handler (request, reply) {
        const { bookId } = request.params

        const response = db('books').where({id: bookId}).then((rows) => {
          const book = rows[0]
          if (!book) {
            throw Boom.notFound(`No book found with id: ${bookId}`)
          }

          if (book.checkedOutBy) {
            throw Boom.conflict(`Book checked out to ${book.checkedOutBy}`)
          }
          return book
        }).then((book) => {
          return db('books').where({id: bookId}).update({
            checkedOutById: request.auth.credentials.twitterId,
            checkedOutBy: request.auth.credentials.twitterUsername,
            checkedOutDue: new Date(Date.now() + ms.weeks(2))
          })
        }).then(() => {
          return db('books').where({id: bookId}).increment('checkedOutCount')
        }).then(() => {
          return db('books').where({id: bookId})
        }).then((rows) => {
          return rows[0]
        })

        reply(response)
      },
      validate: {
        params: {
          bookId: id
        }
      }
    }
  })

  server.route({
    method: 'DELETE',
    path: '/books/{bookId}/checkout',
    config: {
      description: 'Return a book',
      tags: ['action'],
      handler (request, reply) {
        const { bookId } = request.params

        const response = db('books').where({id: bookId}).then((rows) => {
          const book = rows[0]
          if (!book) {
            throw Boom.notFound(`No book found with id: ${bookId}`)
          }

          if (!book.checkedOutBy) {
            throw Boom.badRequest(`Book id: ${bookId} is already checked in`)
          }

          if (book.checkedOutById !== request.auth.credentials.twitterId) {
            throw Boom.badRequest(`Book id: ${bookId} is checked out by someone else`)
          }

          return book
        }).then((book) => {
          return db('books').where({id: bookId}).update({
            checkedOutById: null,
            checkedOutBy: null,
            checkedOutDue: null
          })
        }).then(() => {
          return db('books').where({id: bookId})
        }).then((rows) => {
          return rows[0]
        })

        reply(response)
      },
      validate: {
        params: {
          bookId: id
        }
      }
    }
  })

  next()
}

register.attributes = {
  name: 'books',
  version: '1.0.0'
}

export default { register }
