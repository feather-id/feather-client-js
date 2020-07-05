module.exports = function update(client, user, params) {
  return new Promise(function(resolve, reject) {
    client._gateway.users
      .update(user.id, params, user.tokens.accessTokens.feather)
      .then(updatedUser => {
        updatedUser.tokens = user.tokens;
        return client._setCurrentUser(updatedUser);
      })
      .then(() => client.currentUser())
      .then(currentUser => resolve(currentUser))
      .catch(error => reject(error));
  });
};
