module.exports = function refreshTokens(client) {
  return new Promise(function(resolve, reject) {
    client._gateway.users
      .refreshTokens(
        client.currentUser.id,
        client.currentUser.tokens.refreshToken
      )
      .then(user => resolve(client._setCurrentUser(user)))
      .catch(error => reject(error));
  });
};
