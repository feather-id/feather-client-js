module.exports = function update(client, credential, params) {
  return new Promise(function(resolve, reject) {
    const parseQueryParams = urlStr => {
      return new URL(urlStr).searchParams
        .toString()
        .split("&")
        .reduce((previous, current) => {
          const [key, value] = current.split("=");
          previous[key] = value;
          return previous;
        }, {});
    };

    if (params.hasOwnProperty("verificationLink")) {
      params.verificationCode = parseQueryParams(params.verificationLink).code;
      delete params.verificationLink;
    }

    client._gateway.credentials
      .update(credential.id, params)
      .then(updatedCredential =>
        client._setCurrentCredential(updatedCredential)
      )
      .then(() => client.currentCredential())
      .then(currentCredential => resolve(currentCredential))
      .catch(error => reject(error));
  });
};
