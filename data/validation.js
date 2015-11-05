import Joi from 'joi'

export const optionalId = Joi.number().integer().positive()
export const id = optionalId.required()

export const pagination = Joi.object().keys({
  limit: Joi.number().integer().min(1).max(100).default(10),
  offset: Joi.number().integer().min(0).default(0)
})

/*
  Books
*/
const bookBase = {
  title: Joi.string().min(3).max(30).trim(),
  author_id: id,
  description: Joi.string().min(3).max(300).trim()
}
export const bookUpdate = Joi.object(bookBase)
export const newBook = Joi.object(bookBase)
  .requiredKeys('title', 'author_id', 'description')
export const book = newBook.keys({id})

/*
  Authors
*/
const authorBase = {
  name: Joi.string().min(3).max(60).trim().required(),
  phone: Joi.string().regex(/^[0-9\(\) \+]*$/).trim().required(),
  title: Joi.string().min(0).max(30).trim().required()
}
export const newAuthor = Joi.object(authorBase)
export const author = newAuthor.keys({id})
