const utils = require("../utils");
const {
  FeatherError,
  FeatherErrorType,
  FeatherErrorCode
} = require("../../errors");

const passwords = {
  _gateway: null,

  /**
   * Updates a password
   * @arg newPassword
   * @arg credentialToken
   * @return password
   */
  update: function(newPassword, credentialToken) {
    const that = this;
    return new Promise(function(resolve, reject) {
      // Validate input
      if (typeof newPassword !== "string") {
        reject(
          new FeatherError({
            type: FeatherErrorType.VALIDATION,
            code: FeatherErrorCode.PARAMETER_INVALID,
            message: `expected param 'newPassword' to be of type 'string'`
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

      // Send request
      const data = { newPassword, credentialToken };
      const path = `/passwords`;
      that._httpGateway
        .sendRequest("POST", path, data)
        .then(res => resolve(res))
        .catch(err => reject(err));
    });
  }
};

module.exports = passwords;
