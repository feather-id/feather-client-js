module.exports = function updatePassword(client, newPassword, credentialToken) {
  return new Promise(function(resolve, reject) {
    client._gateway.passwords
      .create(newPassword, credentialToken)
      .then(updatedUser => {
        updatedUser.tokens = user.tokens;
        return client._setCurrentUser(updatedUser);
      })
      .then(() => client.currentUser())
      .then(currentUser => resolve(currentUser))
      .catch(error => reject(error));
  });
};
