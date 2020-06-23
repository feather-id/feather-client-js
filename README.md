# Feather Client Javascript Library

![npm](https://img.shields.io/npm/v/feather-id?color=5c70d6) [![Build Status](https://travis-ci.org/feather-id/feather-node.svg?branch=master)](https://travis-ci.org/feather-id/feather-node) [![Coverage Status](https://coveralls.io/repos/github/feather-id/feather-node/badge.svg?branch=master)](https://coveralls.io/github/feather-id/feather-node?branch=master)

This library provides a convenient interface to the Feather API for applications running in a Javascript-supported browser client environment.

## Installation

```sh
$ npm install feather-id --save
# or
$ yarn add feather-id
```

## Usage

The Feather package must be initialized with your project's API key, available on the [Feather Dashboard](https://feather.id/dashboard). Include the API key when you require the package:

```js
const feather = require("feather-id")("live_...");
```

### Using Promises

Every method returns a promise:

```js
feather.credentials
  .create({
    type: "username|password",
    username: "jdoe",
    password: "pa$$w0rd"
  })
  .then(credential => {
    return feather.sessions.create({
      credential_token: credential.token
    });
  })
  .then(session => {
    return feather.users.retrieve(session.user_id);
  })
  .then(user => {
    // User of the newly created session
  })
  .catch(error => {
    // Handle errors
  });
```

## Development

If you do not have `yarn` installed, you can install it with `npm install --global yarn`.

Run the tests:

```sh
$ yarn install
$ yarn test
```

## More Information

- [Feather Docs](https://feather.id/docs)
- [API Reference](https://feather.id/docs/reference/api)
- [Error Handling](https://feather.id/docs/reference/api#errors)
