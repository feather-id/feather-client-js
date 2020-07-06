const utils = require("../utils");
const {
  FeatherError,
  FeatherErrorType,
  FeatherErrorCode
} = require("../../errors");

const passwords = {
  _gateway: null,

  /**
   * Creates a password
   * @arg password
   * @arg credentialToken
   * @return password
   */
  create: function(password, credentialToken) {
    const that = this;
    return new Promise(function(resolve, reject) {
      // Validate input
      if (typeof password !== "string") {
        reject(
          new FeatherError({
            type: FeatherErrorType.VALIDATION,
            code: FeatherErrorCode.PARAMETER_INVALID,
            message: `expected param 'password' to be of type 'string'`
          })
        );
        return;
      }
      if (typeof credentialToken !== "string") {
        reject(
          new FeatherError({
            type: FeatherErrorType.VALIDATION,
            code: FeatherErrorCode.PARAMETER_INVALID,
            message: `expected param 'credentialToken' to be of type 'string'`
          })
        );
        return;
      }
      const headers = {
        "X-Credential-Token": credentialToken
      };

      // Send request
      const data = { password };
      that._httpGateway
        .sendRequest("POST", "/passwords", data, headers)
        .then(res => resolve(res))
        .catch(err => reject(err));
    });
  }
};

module.exports = passwords;
