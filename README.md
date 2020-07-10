# Feather Client Javascript Library

![npm](https://img.shields.io/npm/v/feather-id?color=5c70d6)

This library provides a convenient stateful interface to the Feather API for applications running in a Javascript client environment.

## Install

```sh
$ npm install feather-client-js --save
# or
$ yarn add feather-client-js
```

## Usage

The Feather package must be initialized with your project's API key, available on the [Feather Dashboard](https://feather.id/dashboard). Include the API key when you require the package:

```js
import { Feather } from "feather-client-js";

const feather = Feather("YOUR_API_KEY");
```

To listen for changes to the authentication state:

```js
feather.onStateChange(currentUser => {
  console.log(`The current user is: ${JSON.stringify(currentUser)}`);
});
```

To sign in:

```js
feather
  .newCurrentCredential({
    email: "foo@example.com",
    password: "pa$$w0rd"
  })
  .then(credential => {
    if (credential.status !== "valid")
      throw new Error("Email or password is incorrect.");
    return feather.newCurrentUser(credential.token);
  })
  .then(currentUser => console.log(currentUser))
  .catch(e => {
    // Handle errors
  });
```

To sign in anonymously:

```js
feather
  .newCurrentUser()
  .then(currentUser => console.log(currentUser))
  .catch(e => {
    // Handle errors
  });
```

To sign out:

```js
feather
  .currentUser()
  .then(currentUser => currentUser.revokeTokens())
  .catch(e => {
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
