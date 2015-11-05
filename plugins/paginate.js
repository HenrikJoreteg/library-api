// Pagination plugin
// For consistent pagination results
const register = (server, options, next) => {
  server.ext('onPreResponse', (request, reply) => {
    if (request.query.limit) {
      const { source } = request.response
      request.response.source = {
        offset: request.query.offset,
        limit: request.query.limit,
        data: source
      }
    }

    return reply.continue()
  })

  next()
}

register.attributes = {
  name: 'pagination',
  version: '1.0.0'
}

export default { register }
