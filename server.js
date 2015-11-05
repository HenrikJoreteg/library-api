import Hapi from 'hapi'
import Good from 'good'
import GoodConsole from 'good-console'
import AuthCookie from 'hapi-auth-cookie'
import Vision from 'vision'
import Inert from 'inert'
import Lout from 'lout'
import Bell from 'bell'
import PaginationPlugin from './plugins/paginate'
import AuthSetup from './plugins/auth-strategy'
import BookRoutes from './routes/books'
import AuthorRoutes from './routes/authors'

const server = new Hapi.Server({ debug: { request: ['error'] } })
const port = process.env.PORT || 3000

server.connection({
  host: '0.0.0.0',
  routes: {
    cors: {
      credentials: true
    }
  },
  port
})

server.register([
  Inert,
  Vision,
  Lout,
  Bell,
  AuthCookie,
  AuthSetup,
  {
    register: Good,
    options: {
      reporters: [{
        reporter: GoodConsole,
        events: { log: '*', response: '*' }
      }]
    }
  },
  BookRoutes,
  AuthorRoutes,
  PaginationPlugin
], (err) => {
  if (err) {
    throw err
  }
})

server.start(() => {
  process.stdout.write(`api server started at ${server.info.uri}\n`)
})

module.exports = server
