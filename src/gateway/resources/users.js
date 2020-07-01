const utils = require("../utils");
const {
  FeatherError,
  FeatherErrorType,
  FeatherErrorCode
} = require("../../errors");

const users = {
  _gateway: null,

  /**
   * Retrieves a user
   * @arg id
   * @return user
   */
  retrieve: function(id, accessToken) {
    const that = this;
    return new Promise(function(resolve, reject) {
      // Validate input
      if (typeof id !== "string") {
        reject(
          new FeatherError({
            type: FeatherErrorType.VALIDATION,
            code: FeatherErrorCode.PARAMETER_INVALID,
            message: `expected param 'id' to be of type 'string'`
          })
        );
        return;
      }
      if (typeof accessToken !== "string") {
        reject(
          new FeatherError({
            type: FeatherErrorType.VALIDATION,
            code: FeatherErrorCode.HEADER_MISSING,
            message: `expected param 'accessToken' to be of type 'string'`
          })
        );
      }
      const headers = { Authorization: "Bearer " + accessToken };

      // Send request
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
   * @arg { metadata }
   * @arg accessToken
   * @return user
   */
  update: function(id, data, accessToken) {
    const that = this;
    return new Promise(function(resolve, reject) {
      // Validate input
      if (typeof id !== "string") {
        reject(
          new FeatherError({
            type: FeatherErrorType.VALIDATION,
            code: FeatherErrorCode.PARAMETER_INVALID,
            message: `expected param 'id' to be of type 'string'`
          })
        );
        return;
      }
      try {
        utils.validateData(data, {
          isRequired: true,
          params: {
            metadata: {
              type: "object"
            }
          }
        });
      } catch (error) {
        reject(error);
        return;
      }
      if (typeof accessToken !== "string") {
        reject(
          new FeatherError({
            type: FeatherErrorType.VALIDATION,
            code: FeatherErrorCode.HEADER_MISSING,
            message: `expected param 'accessToken' to be of type 'string'`
          })
        );
      }
      const headers = { Authorization: "Bearer " + accessToken };

      // Send request
      that._httpGateway
        .sendRequest("POST", "/users/" + id, data, headers)
        .then(res => resolve(res))
        .catch(err => reject(err));
    });
  },

  /**
   * Updates a user's email
   * @arg id
   * @arg { credentialToken, newEmail }
   * @arg accessToken
   * @return user
   */
  updateEmail: function(id, data) {
    const that = this;
    return new Promise(function(resolve, reject) {
      // Validate input
      if (typeof id !== "string") {
        reject(
          new FeatherError({
            type: FeatherErrorType.VALIDATION,
            code: FeatherErrorCode.PARAMETER_INVALID,
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
            newEmail: {
              type: "string",
              isRequired: true
            }
          }
        });
      } catch (error) {
        reject(error);
        return;
      }
      if (typeof accessToken !== "string") {
        reject(
          new FeatherError({
            type: FeatherErrorType.VALIDATION,
            code: FeatherErrorCode.HEADER_MISSING,
            message: `expected param 'accessToken' to be of type 'string'`
          })
        );
      }
      const headers = { Authorization: "Bearer " + accessToken };

      // Send request
      const path = "/users/" + id + "/email";
      that._httpGateway
        .sendRequest("POST", path, data, headers)
        .then(res => resolve(res))
        .catch(err => reject(err));
    });
  },

  /**
   * Updates a user's password
   * @arg id
   * @arg { credentialToken, newPassword }
   * @arg accessToken
   * @return user
   */
  updatePassword: function(id, data) {
    const that = this;
    return new Promise(function(resolve, reject) {
      // Validate input
      if (typeof id !== "string") {
        reject(
          new FeatherError({
            type: FeatherErrorType.VALIDATION,
            code: FeatherErrorCode.PARAMETER_INVALID,
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
      if (typeof accessToken !== "string") {
        reject(
          new FeatherError({
            type: FeatherErrorType.VALIDATION,
            code: FeatherErrorCode.HEADER_MISSING,
            message: `expected param 'accessToken' to be of type 'string'`
          })
        );
      }
      const headers = { Authorization: "Bearer " + accessToken };

      // Send request
      const path = "/users/" + id + "/password";
      that._httpGateway
        .sendRequest("POST", path, data, headers)
        .then(res => resolve(res))
        .catch(err => reject(err));
    });
  }
};

module.exports = users;
