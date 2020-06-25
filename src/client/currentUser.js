const { fetchCurrentState, updateCurrentState } = require("./database");

module.exports = function currentUser() {
  const that = this;
  return new Promise(function(resolve, reject) {
    fetchCurrentState()
      .then(state => resolve(state ? state.user : null))
      .catch(error => reject(error));
  });
};
