import config from '../config'
import Joi from 'joi'
import db from '../db-connection'

// Auth setup plugin
const register = (server, options, next) => {
  server.auth.strategy('session', 'cookie', true, {
    cookie: 'sid',
    password: config.cookiePassword
  })

  server.auth.strategy('oauth', 'bell', {
    provider: 'twitter',
    password: config.cookiePassword,
    clientId: config.twitter.clientId,
    clientSecret: config.twitter.clientSecret,
    forceHttps: true
  })

  // This route is used by bell for the oauth flow to authenticate
  // a user with the nominated provider.
  server.route({
    method: ['GET', 'POST'],
    path: '/do-login',
    config: {
      // Use the 'oauth' auth strategy to allow bell to handle the oauth flow.
      auth: 'oauth',
      handler: function loginHandler (request, reply) {
        // Here we take the profile pulled in by bell and set it to our
        // session cookie.
        const { profile } = request.auth.credentials
        const user = {
          twitterId: profile.id,
          twitterImage: profile.raw.profile_image_url,
          twitterUsername: profile.raw.screen_name
        }

        let librarian = false

        db('users').where({twitterId: profile.id}).then((result) => {
          // update or insert this user
          if (result.length === 1) {
            if (result[0].librarian) {
              librarian = true
            }
            return db('users').update(user)
          } else {
            return db('users').insert(user)
          }
        }).then(() => {
          // add librarian scope if relevant
          if (librarian) {
            user.scope = ['librarian']
          }

          // Pick out a few things to put into the encrypted session cookie.
          // storing the whole thing exceeds cookie size limits
          request.auth.session.set(user)

          // User is now logged in, redirect them to their account area
          reply.redirect(request.state.nextUrl).unstate('nextUrl')
        })
      }
    }
  })

  server.route({
    method: 'GET',
    path: '/login',
    config: {
      auth: {
        mode: 'try'
      },
      handler (request, reply) {
        const { redirectUri } = request.query
        reply.redirect('/do-login').state('nextUrl', redirectUri)
      },
      validate: {
        query: {
          redirectUri: Joi.string().uri().required()
        }
      }
    }
  })

  server.route({
    method: 'GET',
    path: '/me',
    config: {
      auth: {
        mode: 'try'
      },
      handler (request, reply) {
        reply(request.auth.credentials || {})
      }
    }
  })

  // This route is used to the logout the user.  This will **not**
  // logout the user from the provider they used to login.
  server.route({
    method: 'GET',
    path: '/logout',
    config: {
      auth: false,
      handler: function logoutHandler (request, reply) {
        const { redirectUri } = request.query
        request.auth.session.clear()
        reply.redirect(redirectUri || '/')
      }
    }
  })

  next()
}

register.attributes = {
  name: 'auth',
  version: '1.0.0'
}

export default { register }
