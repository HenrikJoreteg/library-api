exports.up = function (knex) {
  return knex.schema
    .createTable('users', (t) => {
      t.string('twitterId').primary()
      t.string('twitterUsername')
      t.string('twitterImage')
      t.boolean('librarian').default(false)
      t.timestamps()
    })
    .createTable('authors', (t) => {
      t.increments('id').primary()
      t.string('name')
      t.text('bio')
      t.string('imageUrl')
    })
    .createTable('books', (t) => {
      t.increments('id').primary()
      t.integer('authorId').references('id').inTable('authors')
      t.string('title')
      t.text('description')
      t.string('imageUrl')
      t.string('checkedOutById').references('twitterId').inTable('users')
      t.string('checkedOutBy')
      t.dateTime('checkedOutDue')
      t.integer('checkedOutCount').default(0)
    })
}

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('books')
    .dropTableIfExists('librarians')
    .dropTableIfExists('authors')
    .dropTableIfExists('users')
}
