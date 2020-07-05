const { fetchCurrentState } = require("../database");
const credentialUpdate = require("./update.js");

module.exports = function get(client) {
  return new Promise(function(resolve, reject) {
    fetchCurrentState()
      .then(state => {
        if (state.credential) {
          resolve({
            ...state.credential,
            update: params => credentialUpdate(client, state.credential, params)
          });
        } else {
          resolve(null);
        }
      })
      .catch(error => reject(error));
  });
};
