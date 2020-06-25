const {
  FeatherError,
  FeatherErrorType,
  FeatherErrorCode
} = require("../errors");
const { fetchCurrentState, updateCurrentState } = require("./database");

// TODO Update user with provided (optional) metadata after sign-in

module.exports = function signIn(email, password) {
  var that = this;
  return new Promise(function(resolve, reject) {
    fetchCurrentState()
      .then(state => {
        if (!!state.user && !state.user.isAnonymous) {
          throw new FeatherError({
            type: FeatherErrorType.VALIDATION,
            code: FeatherErrorCode.CURRENT_STATE_INCONSISTENT,
            message: "The current user is already authenticated."
          });
        } else {
          return Promise.all([
            state.session,
            that._gateway.credentials.create({
              email,
              password
            })
          ]);
        }
      })
      .then(([session, credential]) => {
        if (credential.status !== "valid") {
          throw new FeatherError({
            type: FeatherErrorType.VALIDATION,
            code: FeatherErrorCode.CREDENTIAL_INVALID,
            message: "Incorrect email or password."
          });
        }
        const credentialToken = credential.token;
        if (session) {
          return that._gateway.sessions.update(session.id, {
            credentialToken
          });
        } else {
          return that._gateway.sessions.create({ credentialToken });
        }
      })
      .then(session => {
        that._gateway.setXFeatherSessionHeader(session.token);
        Promise.all([
          session,
          that._gateway.users.retrieve(session.userId, session.token)
        ]);
      })
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
