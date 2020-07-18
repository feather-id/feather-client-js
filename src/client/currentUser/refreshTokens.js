const { FeatherErrorCode } = require("../../errors");

module.exports = function refreshTokens(client, user) {
  return new Promise(function(resolve, reject) {
    client._gateway.users
      .refreshTokens(user.id, user.tokens.refreshToken)
      .then(updatedUser => client._setCurrentUser(updatedUser))
      .then(() => client.currentUser())
      .then(currentUser => resolve(currentUser))
      .catch(error => {
        if (error.code === FeatherErrorCode.TOKEN_INVALID) {
          client._setCurrentUser(null);
          resolve(null);
        } else {
          reject(error);
        }
      });
  });
};
