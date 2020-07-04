module.exports = function updateEmail(client, newEmail, credentialToken) {
  return new Promise(function(resolve, reject) {
    client._gateway.users
      .updateEmail(
        client.currentUser.id,
        newEmail,
        client.currentUser.tokens.accessTokens.feather,
        credentialToken
      )
      .then(user => resolve(client._setCurrentUser(user)))
      .catch(error => reject(error));
  });
};
