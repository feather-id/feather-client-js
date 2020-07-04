module.exports = function update(client, credential, params) {
  return new Promise(function(resolve, reject) {
    client._gateway.credentials
      .update(credential.id, params)
      .then(updatedCredential =>
        resolve(client._setCurrentCredential(updatedCredential))
      )
      .catch(error => reject(error));
  });
};
