# Library Data Sample API

This is a node.js api server written using [hapi](http://hapijs.com) framework. 

It's written in ES6 transpiled with Babel to allow full ES6 support. In order to use all of the ES6 features we're using [babel.js](https://babeljs.io) transpiler via the [require hook](https://babeljs.io/docs/usage/require/) as can be seen in index.js.

## Running Locally

```
npm install
npm start
open http://localhost:3000
```

## API documentation

The API is set up to generate its own documentation based on metadata provided with each server route. Since the documentation is generated from the actual route data itself, that helps mitigate out-of-date documentation. 

You can see the list of routes by running the server as described above and visiting: `/docs` in a browser. 

## How configs are handled

Any time you need access to config items within code simply require the `/.config.js` file at the project root.

It will pull in the configuration file from the `config` directory with the same name as the current value of the `NODE_ENV` envronment variable. If `NODE_ENV` is not defined, `./config/development.json` will be used.

Please note that all sensitive data is expected to be passed via environment variables rather than checked into this codebase.

To support this, the config reading module will replace any strings in the config that look like this: `$HELLO_WORLD` with the corresponding value from `process.env`. If the value doesn't exist, the module will throw an error letting you know what's missing.

This allows us to check-in all the config files, allows configs to have arbitrary structure, and allows all non-sensitive configuration changes to be checked into the repo.

To repeat: **please avoid putting any sensitive data** into this code repository. 

## Running scripts

Run `npm run` to see all available scripts.

`npm run lint` will run linting tests on the whole project.

`npm run init-db` will create and seed a local SQLite3 database to use for development.

## CORS

In order to support easily building web clients to interract with this API, the **C**ross **O**rigin **R**esource **S**haring policy for the API is open to all domains.

## Running tests

`npm test`