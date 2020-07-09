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
   * @return user
   */
  create: function(credentialToken) {
    const that = this;
    return new Promise(function(resolve, reject) {
      // Validate input
      var data = {};
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
        data = { credentialToken: credentialToken };
      }

      // Send request
      const path = `/users`;
      that._httpGateway
        .sendRequest("POST", path, data)
        .then(res => resolve(res))
        .catch(err => reject(err));
    });
  },

  /**
   * Retrieves a user
   * @arg id
   * @return user
   */
  retrieve: function(id, idToken) {
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
      if (typeof idToken !== "string") {
        reject(
          new FeatherError({
            type: FeatherErrorType.VALIDATION,
            code: FeatherErrorCode.HEADER_MISSING,
            message: `expected param 'idToken' to be of type 'string'`
          })
        );
      }
      const headers = { Authorization: "Bearer " + idToken };

      // Send request
      const path = `/users/${id}`;
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
   * @arg idToken
   * @return user
   */
  update: function(id, data, idToken) {
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
      if (typeof idToken !== "string") {
        reject(
          new FeatherError({
            type: FeatherErrorType.VALIDATION,
            code: FeatherErrorCode.HEADER_MISSING,
            message: `expected param 'idToken' to be of type 'string'`
          })
        );
      }
      const headers = { Authorization: "Bearer " + idToken };

      // Send request
      const path = `/users/${id}`;
      that._httpGateway
        .sendRequest("POST", path, data, headers)
        .then(res => resolve(res))
        .catch(err => reject(err));
    });
  },

  /**
   * Updates a user's email
   * @arg id
   * @arg newEmail
   * @arg idToken
   * @arg credentialToken
   * @return user
   */
  updateEmail: function(id, newEmail, credentialToken, idToken) {
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
      if (typeof idToken !== "string") {
        reject(
          new FeatherError({
            type: FeatherErrorType.VALIDATION,
            code: FeatherErrorCode.HEADER_MISSING,
            message: `expected param 'idToken' to be of type 'string'`
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
      const headers = { Authorization: "Bearer " + idToken };
      const data = { newEmail, credentialToken };

      // Send request
      const path = `/users/${id}/email`;
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
      const data = { refreshToken };

      // Send request
      const path = `/users/${id}/tokens`;
      that._httpGateway
        .sendRequest("POST", path, data)
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
      const data = { refreshToken };

      // Send request
      const path = `/users/${id}/tokens`;
      that._httpGateway
        .sendRequest("DELETE", path, data)
        .then(res => resolve(res))
        .catch(err => reject(err));
    });
  }
};

module.exports = users;
