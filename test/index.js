import assert from 'assert'
import Lab from 'lab'
import { book } from '../data/validation'
import ensure from './helpers'

const lab = exports.lab = Lab.script()

lab.test('fetch books', (done) => {
  ensure({
    method: 'GET',
    url: '/books?limit=12',
    hasPagination: true
  }, done)
})

lab.test('fetch a specific book', (done) => {
  ensure({
    method: 'GET',
    url: '/books/1',
    hasPagination: false,
    schema: book
  }, done)
})

lab.test('CRUD a book', {timeout: 2000}, (done) => {
  const properties = {
    name: 'Bingcubator Hack 2025',
    slug: 'bingcubator-hack-2025',
    description: 'Yo!',
    logo_url: 'http://example.com/hack.gif',
    start_date: new Date(),
    end_date: new Date(new Date(Date.now() + 86400 * 5))
  }

  ensure({
    method: 'POST',
    url: '/books',
    statusCode: 201,
    payload: properties
  })
  .then(() => {
    return ensure({
      method: 'GET',
      url: '/books/3',
      schema: book
    })
  })
  .then(() => {
    return ensure({
      method: 'PUT',
      url: '/books/3',
      payload: {
        name: 'Bingcubator Hack 2015',
        slug: 'bingcubator-hack-2015'
      }
    })
  })
  .then(() => {
    return ensure({
      method: 'GET',
      url: '/books/3',
      test (result) {
        assert.equal(result.name, 'Bingcubator Hack 2015', 'name should have changed')
        assert.equal(result.slug, 'bingcubator-hack-2015', 'slug should have changed')
      }
    })
  })
  .then(() => {
    return ensure({
      method: 'DELETE',
      url: '/books/3',
      statusCode: 204
    })
  })
  .then(() => {
    return ensure({
      method: 'GET',
      url: '/books/3',
      statusCode: 404
    }, done)
  })
})
