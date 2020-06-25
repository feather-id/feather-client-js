const {
  FeatherError,
  FeatherErrorType,
  FeatherErrorCode
} = require("../errors");
const { fetchCurrentState, updateCurrentState } = require("./database");
const { parseQueryParams } = require("./utils.js");

module.exports = function confirmForgotPasswordLink(url, newPassword) {
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
              "There is no current forgot-password request on this client. Please note a forgot-password request can only be confirmed from the device and browser it was initiated from."
          });
        } else if (!params.code) {
          throw new FeatherError({
            type: FeatherErrorType.VALIDATION,
            code: FeatherErrorCode.VERIFICATION_CODE_INVALID,
            message: "The provided URL is missing a 'code' query parameter."
          });
        } else {
          return Promise.all([
            state,
            that._gateway.credentials.update(state.credential.id, {
              verificationCode: params.code
            })
          ]);
        }
      })
      .then(([state, credential]) => {
        if (credential.status !== "valid") {
          throw new FeatherError({
            type: FeatherErrorType.VALIDATION,
            code: FeatherErrorCode.VERIFICATION_CODE_INVALID,
            message: "The verification code is invalid."
          });
        }
        const credentialToken = credential.token;
        return Promise.all([
          session,
          that._gateway.users.updatePassword(session.userId, {
            credentialToken,
            newPassword
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
