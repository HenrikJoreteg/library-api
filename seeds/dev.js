require('babel/register')
var data = require('../data/mock-data')

exports.seed = function (knex, Promise) {
  return Promise.resolve()
    .then(function () {
      return knex('users').del().insert(data.users)
    })
    .then(function () {
      return knex('librarians').del().insert(data.librarians)
    })
    .then(function () {
      return knex('authors').del().insert(data.authors)
    })
    .then(function () {
      return knex('books').del().insert(data.books)
    })
}
