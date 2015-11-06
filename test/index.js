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
