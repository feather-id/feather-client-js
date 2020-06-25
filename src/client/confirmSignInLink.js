const {
  FeatherError,
  FeatherErrorType,
  FeatherErrorCode
} = require("feather-client-js");
const { fetchCurrentState, updateCurrentState } = require("./database");
const { parseQueryParams } = require("./utils.js");

module.exports = function confirmSignInLink(url) {
  const that = this;
  return new Promise(function(resolve, reject) {
    fetchCurrentState()
      .then(state => {
        const params = parseQueryParams(url);
        if (!state.credential) {
          throw new FeatherError({
            type: FeatherErrorType.VALIDATION,
            code: FeatherErrorCode.CURRENT_STATE_INCONSISTENT,
            message:
              "There is no current passwordless sign-in request on this client. Please note a passwordless sign-in request can only be confirmed from the device and browser it was initiated from."
          });
        } else if (!params.code) {
          throw new FeatherError({
            type: FeatherErrorType.VALIDATION,
            code: FeatherErrorCode.VERIFICATION_CODE_INVALID,
            message: "The provided URL is missing a 'code' query parameter."
          });
        } else {
          return Promise.all([
            state.session,
            that._gateway.credentials.update(state.credential.id, {
              verificationCode: params.code
            })
          ]);
        }
      })
      .then(([session, credential]) => {
        if (credential.status !== "valid") {
          throw new FeatherError({
            type: FeatherErrorType.VALIDATION,
            code: FeatherErrorCode.VERIFICATION_CODE_INVALID,
            message: "The verification code is invalid."
          });
        }
        const credentialToken = credential.token;
        if (session) {
          return that._gateway.sessions.upgrade(session.id, {
            credentialToken
          });
        } else {
          return that._gateway.sessions.create({ credentialToken });
        }
      })
      .then(session =>
        Promise.all([
          session,
          that._gateway.users.retrieve(session.userId, session.token)
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
