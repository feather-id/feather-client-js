module.exports = function newCurrentUser(client, credentialToken) {
  return new Promise(function(resolve, reject) {
    client._gateway.users
      .create(credentialToken)
      .then(user => resolve(client._setCurrentUser(user)))
      .catch(error => reject(error));
  });
};
