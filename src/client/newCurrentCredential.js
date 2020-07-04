module.exports = function newCurrentUser(client, params) {
  return new Promise(function(resolve, reject) {
    client._gateway.credentials
      .create(params)
      .then(credential => resolve(client._setCurrentCredential(credential)))
      .catch(error => reject(error));
  });
};
