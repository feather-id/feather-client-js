module.exports = function updateEmail(client, newPassword, credentialToken) {
  return new Promise(function(resolve, reject) {
    client._gateway.users
      .updatePassword(
        client.currentUser.id,
        newPassword,
        client.currentUser.tokens.accessTokens.feather,
        credentialToken
      )
      .then(user => resolve(client._setCurrentUser(user)))
      .catch(error => reject(error));
  });
};
