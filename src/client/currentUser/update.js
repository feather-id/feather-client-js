module.exports = function update(client, params) {
  return new Promise(function(resolve, reject) {
    client._gateway.users
      .update(
        client.currentUser.id,
        params,
        client.currentUser.tokens.accessTokens.feather
      )
      .then(user => resolve(client._setCurrentUser(user)))
      .catch(error => reject(error));
  });
};
