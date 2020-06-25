const {
  FeatherError,
  FeatherErrorType,
  FeatherErrorCode
} = require("../errors");
const { fetchCurrentState, updateCurrentState } = require("./database");

module.exports = function updateUser(params) {
  const that = this;
  return new Promise(function(resolve, reject) {
    fetchCurrentState()
      .then(state => {
        if (!state.user) {
          throw new FeatherError({
            type: FeatherErrorType.VALIDATION,
            code: FeatherErrorCode.CURRENT_STATE_INCONSISTENT,
            message: "There is no current user on this client."
          });
        } else {
          return Promise.all([
            state,
            that._gateway.users.updateEmail(state.user.id, {
              metadata: params.metadata
            })
          ]);
        }
      })
      .then(([state, user]) => {
        state.user = user;
        return updateCurrentState(state);
      })
      .then(() => {
        that._notifyStateObservers();
        resolve();
      })
      .catch(error => reject(error));
  });
};
