module.exports = function update(client, params) {
  return new Promise(function(resolve, reject) {
    client._gateway.credentials
      .update(client.currentCredential.id, params)
      .then(user => resolve(client._setCurrentUser(user)))
      .catch(error => reject(error));
  });
};
