const {
  FeatherError,
  FeatherErrorType,
  FeatherErrorCode
} = require("feather-client-js");
const { fetchCurrentState, updateCurrentState } = require("./database");

module.exports = function updateUserEmail(password, newEmail) {
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
        } else if (state.user.isAnonymous) {
          throw new FeatherError({
            type: FeatherErrorType.VALIDATION,
            code: FeatherErrorCode.CURRENT_STATE_INCONSISTENT,
            message:
              "The current user is anonymous and their email cannot be updated."
          });
        } else {
          return Promise.all([
            state,
            that._gateway.credentials.create({
              password,
              email: state.user.email
            })
          ]);
        }
      })
      .then(([state, credential]) => {
        if (credential.status !== "valid") {
          throw new FeatherError({
            type: FeatherErrorType.VALIDATION,
            code: FeatherErrorCode.CREDENTIAL_INVALID,
            message: "Incorrect password."
          });
        }
        const credentialToken = credential.token;
        return Promise.all([
          state,
          that._gateway.users.updateEmail(state.user.id, {
            credentialToken,
            newEmail
          })
        ]);
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
