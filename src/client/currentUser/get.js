const { fetchCurrentState } = require("../database");
const userRefreshTokens = require("./refreshTokens.js");
const userRevokeTokens = require("./revokeTokens.js");
const userUpdate = require("./update.js");
const userUpdateEmail = require("./updateEmail.js");
const userUpdatePassword = require("./updatePassword.js");

module.exports = function get(client) {
  return new Promise(function(resolve, reject) {
    fetchCurrentState()
      .then(state => {
        if (state) {
          if (state.user) {
            resolve({
              ...state.user,
              refreshTokens: () => userRefreshTokens(client, state.user),
              revokeTokens: () => userRevokeTokens(client, state.user),
              update: params => userUpdate(client, state.user, params),
              updateEmail: (newEmail, credentialToken) =>
                userUpdateEmail(client, state.user, newEmail, credentialToken),
              updatePassword: (newPassword, credentialToken) =>
                userUpdatePassword(
                  client,
                  state.user,
                  newPassword,
                  credentialToken
                )
            });
            return;
          }
        }
        resolve(null);
      })
      .catch(error => reject(error));
  });
};
