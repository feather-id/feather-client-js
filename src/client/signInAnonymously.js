const {
  FeatherError,
  FeatherErrorType,
  FeatherErrorCode
} = require("../errors");
const { fetchCurrentState, updateCurrentState } = require("./database");

// TODO Update user with provided (optional) metadata after sign-in

module.exports = function signInAnonymously() {
  const that = this;
  return new Promise(function(resolve, reject) {
    that
      .currentSession()
      .then(session => {
        if (session) {
          throw new FeatherError({
            type: FeatherErrorType.VALIDATION,
            code: FeatherErrorCode.CURRENT_STATE_INCONSISTENT,
            message: "There is already an active session on this client."
          });
        } else {
          return that._gateway.sessions.create();
        }
      })
      .then(session =>
        Promise.all([
          session,
          that._gateway.users.retrieve(session.userId, session.accessToken)
        ])
      )
      .then(([session, user]) =>
        updateCurrentState({ session, user, credential: null })
      )
      .then(() => {
        that._notifyStateObservers();
        resolve();
      })
      .catch(error => reject(error));
  });
};
