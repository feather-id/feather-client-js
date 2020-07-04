const utils = require("../utils");
const {
  FeatherError,
  FeatherErrorType,
  FeatherErrorCode
} = require("../../errors");

const users = {
  _gateway: null,

  /**
   * Creates a user
   * @arg credentialToken
   * @return session
   */
  create: function(credentialToken) {
    const that = this;
    return new Promise(function(resolve, reject) {
      // Validate input
      var headers = {};
      console.log(credentialToken);
      if (credentialToken) {
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
        headers["X-Credential-Token"] = credentialToken;
      }

      // Send request
      that._httpGateway
        .sendRequest("POST", "/users", null, headers)
        .then(res => resolve(res))
        .catch(err => reject(err));
    });
  },

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
      const headers = { "X-Access-Token": accessToken };

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
      const headers = { "X-Access-Token": accessToken };

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
   * @arg newEmail
   * @arg accessToken
   * @arg credentialToken
   * @return user
   */
  updateEmail: function(id, newEmail, accessToken, credentialToken) {
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
      if (typeof newEmail !== "string") {
        reject(
          new FeatherError({
            type: FeatherErrorType.VALIDATION,
            code: FeatherErrorCode.PARAMETER_INVALID,
            message: `expected param 'newEmail' to be of type 'string'`
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
      if (typeof refreshToken !== "string") {
        reject(
          new FeatherError({
            type: FeatherErrorType.VALIDATION,
            code: FeatherErrorCode.PARAMETER_INVALID,
            message: `expected param 'refreshToken' to be of type 'string'`
          })
        );
        return;
      }
      const headers = {
        "X-Access-Token": accessToken,
        "X-Credential-Token": credentialToken
      };

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
   * @arg newPassword
   * @arg accessToken
   * @arg credentialToken
   * @return user
   */
  updatePassword: function(id, newPassword, accessToken, credentialToken) {
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
      if (typeof accessToken !== "string") {
        reject(
          new FeatherError({
            type: FeatherErrorType.VALIDATION,
            code: FeatherErrorCode.HEADER_MISSING,
            message: `expected param 'accessToken' to be of type 'string'`
          })
        );
      }
      if (typeof credentialToken !== "string") {
        reject(
          new FeatherError({
            type: FeatherErrorType.VALIDATION,
            code: FeatherErrorCode.HEADER_MISSING,
            message: `expected param 'credentialToken' to be of type 'string'`
          })
        );
      }
      const headers = {
        "X-Access-Token": accessToken,
        "X-Credential-Token": credentialToken
      };

      // Send request
      const path = "/users/" + id + "/password";
      that._httpGateway
        .sendRequest("POST", path, data, headers)
        .then(res => resolve(res))
        .catch(err => reject(err));
    });
  },

  /**
   * Refreshes a user's tokens
   * @arg id
   * @arg refreshToken
   * @return user
   */
  refreshTokens: function(id, refreshToken) {
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
      if (typeof refreshToken !== "string") {
        reject(
          new FeatherError({
            type: FeatherErrorType.VALIDATION,
            code: FeatherErrorCode.PARAMETER_INVALID,
            message: `expected param 'refreshToken' to be of type 'string'`
          })
        );
        return;
      }

      const headers = { "X-Refresh-Token": refreshToken };

      // Send request
      const path = `/users/${id}/tokens`;
      that._httpGateway
        .sendRequest("POST", path, data, headers)
        .then(res => resolve(res))
        .catch(err => reject(err));
    });
  },

  /**
   * Revokes a user's tokens
   * @arg id
   * @arg refreshToken
   * @return user
   */
  revokeTokens: function(id, refreshToken) {
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
      if (typeof refreshToken !== "string") {
        reject(
          new FeatherError({
            type: FeatherErrorType.VALIDATION,
            code: FeatherErrorCode.PARAMETER_INVALID,
            message: `expected param 'refreshToken' to be of type 'string'`
          })
        );
        return;
      }
      const headers = { "X-Refresh-Token": refreshToken };

      // Send request
      const path = `/users/${id}/tokens`;
      that._httpGateway
        .sendRequest("DELETE", path, data, headers)
        .then(res => resolve(res))
        .catch(err => reject(err));
    });
  }
};

module.exports = users;
