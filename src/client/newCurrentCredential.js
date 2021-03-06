module.exports = function newCurrentUser(client, params) {
  return new Promise(function(resolve, reject) {
    client._gateway.credentials
      .create(params)
      .then(credential => client._setCurrentCredential(credential))
      .then(() => client.currentCredential())
      .then(currentCredential => resolve(currentCredential))
      .catch(error => reject(error));
  });
};
