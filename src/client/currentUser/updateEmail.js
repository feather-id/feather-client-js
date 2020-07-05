module.exports = function updateEmail(client, user, newEmail, credentialToken) {
  return new Promise(function(resolve, reject) {
    client._gateway.users
      .updateEmail(
        user.id,
        newEmail,
        user.tokens.accessTokens.feather,
        credentialToken
      )
      .then(updatedUser => {
        updatedUser.tokens = user.tokens;
        return client._setCurrentUser(updatedUser);
      })
      .then(() => client.currentUser())
      .then(currentUser => resolve(currentUser))
      .catch(error => reject(error));
  });
};
