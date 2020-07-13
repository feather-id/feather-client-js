const { fetchCurrentState } = require("../database");
const userRefreshTokens = require("./refreshTokens.js");
const userRevokeTokens = require("./revokeTokens.js");
const userUpdate = require("./update.js");
const userUpdateEmail = require("./updateEmail.js");
const userUpdatePassword = require("./updatePassword.js");
const jws = require("jws");

module.exports = function get(client) {
  return new Promise(function(resolve, reject) {
    fetchCurrentState()
      .then(state => {
        if (state) {
          if (state.user) {
            if (shouldRefreshTokens(state.user)) {
              return userRefreshTokens(client, state.user);
            } else {
              return Promise.resolve(state.user);
            }
          }
        }
        resolve(null);
      })
      .then(user => {
        if (user) {
          resolve({
            ...user,
            refreshTokens: () => userRefreshTokens(client, user),
            revokeTokens: () => userRevokeTokens(client, user),
            update: params => userUpdate(client, user, params),
            updateEmail: (newEmail, credentialToken) =>
              userUpdateEmail(client, user, newEmail, credentialToken),
            updatePassword: (newPassword, credentialToken) =>
              userUpdatePassword(client, user, newPassword, credentialToken)
          });
        }
      })
      .catch(error => reject(error));
  });
};

function shouldRefreshTokens(user) {
  if (user.tokens) {
    if (user.tokens.idToken) {
      const decodedToken = jws.decode(user.tokens.idToken);
      const expiresAt = new Date(decodedToken.payload.exp);
      const now = Math.floor(Date.now() / 1000);
      return now > expiresAt - 30;
    }
  }
  return false;
}
