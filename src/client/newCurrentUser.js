module.exports = function newCurrentUser(client, credentialToken) {
  return new Promise(function(resolve, reject) {
    client._gateway.users
      .create(credentialToken)
      .then(user => client._setCurrentUser(user))
      .then(() => client.currentUser())
      .then(currentUser => resolve(currentUser))
      .catch(error => reject(error));
  });
};
