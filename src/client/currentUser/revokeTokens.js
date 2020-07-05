module.exports = function revokeTokens(client, user) {
  return new Promise(function(resolve, reject) {
    client._gateway.users
      .revokeTokens(user.id, user.tokens.refreshToken)
      .then(updatedUser => client._setCurrentUser(null))
      .then(() => resolve(null))
      .catch(error => reject(error));
  });
};
