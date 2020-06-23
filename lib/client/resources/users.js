const utils = require("../utils");
const { FeatherError, ErrorType, ErrorCode } = require("../../errors");

const users = {
  _gateway: null,

  /**
   * Retrieves a user
   * @arg id
   * @return user
   */
  retrieve: function(id, sessionToken) {
    const that = this;
    return new Promise(function(resolve, reject) {
      // Validate input
      if (typeof id !== "string") {
        reject(
          new FeatherError({
            type: ErrorType.VALIDATION,
            code: ErrorCode.PARAMETER_INVALID,
            message: `expected param 'id' to be of type 'string'`
          })
        );
        return;
      }

      // Send request
      const headers = { "x-feather-session": sessionToken };
      const path = "/users/" + id;
      that._httpGateway
        .sendRequest("GET", path, null, headers)
        .then(res => resolve(res))
        .catch(err => reject(err));
    });
  },

  /**
   * Updates a user
   * @arg id
   * @arg { email, username, metadata }
   * @return user
   */
  update: function(id, data) {
    const that = this;
    return new Promise(function(resolve, reject) {
      // Validate input
      if (typeof id !== "string") {
        reject(
          new FeatherError({
            type: ErrorType.VALIDATION,
            code: ErrorCode.PARAMETER_INVALID,
            message: `expected param 'id' to be of type 'string'`
          })
        );
        return;
      }
      try {
        utils.validateData(data, {
          isRequired: true,
          params: {
            email: {
              type: "string"
            },
            username: {
              type: "string"
            },
            metadata: {
              type: "object"
            }
          }
        });
      } catch (error) {
        reject(error);
        return;
      }

      that._httpGateway
        .sendRequest("POST", "/users/" + id, data)
        .then(res => resolve(res))
        .catch(err => reject(err));
    });
  },

  /**
   * Updates a user's password
   * @arg id
   * @arg { credentialToken, newPassword }
   * @return user
   */
  updatePassword: function(id, data) {
    const that = this;
    return new Promise(function(resolve, reject) {
      // Validate input
      if (typeof id !== "string") {
        reject(
          new FeatherError({
            type: ErrorType.VALIDATION,
            code: ErrorCode.PARAMETER_INVALID,
            message: `expected param 'id' to be of type 'string'`
          })
        );
        return;
      }
      try {
        utils.validateData(data, {
          isRequired: true,
          params: {
            credentialToken: {
              type: "string",
              isRequired: true
            },
            newPassword: {
              type: "string",
              isRequired: true
            }
          }
        });
      } catch (error) {
        reject(error);
        return;
      }

      const path = "/users/" + id + "/password";
      that._httpGateway
        .sendRequest("POST", path, data)
        .then(res => resolve(res))
        .catch(err => reject(err));
    });
  }
};

module.exports = users;
