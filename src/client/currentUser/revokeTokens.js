module.exports = function revokeTokens(client) {
  return new Promise(function(resolve, reject) {
    client._gateway.users
      .revokeTokens(
        client.currentUser.id,
        client.currentUser.tokens.refreshToken
      )
      .then(user => resolve(client._setCurrentUser(user)))
      .catch(error => reject(error));
  });
};
