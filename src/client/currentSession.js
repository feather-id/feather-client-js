const { fetchCurrentState, updateCurrentState } = require("./database");

module.exports = function currentSession() {
  const that = this;
  return new Promise(function(resolve, reject) {
    fetchCurrentState()
      .then(state => resolve(state ? state.session : null))
      .catch(error => reject(error));
  });
};
