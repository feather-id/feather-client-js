module.exports = function updatePassword(
  client,
  user,
  newPassword,
  credentialToken
) {
  return new Promise(function(resolve, reject) {
    client._gateway.users
      .updatePassword(
        user.id,
        newPassword,
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
