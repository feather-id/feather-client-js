"use strict";

const utils = require("../utils");
const FeatherError = require("../errors/featherError");
const ErrorType = require("../errors/errorType");
const ErrorCode = require("../errors/errorCode");

const sessions = {
  _gateway: null,
  _parseToken: require("../parseToken"),
  _cachedPublicKeys: {},

  /**
   * Creates a new session
   * @arg { credentialToken }
   * @return session
   */
  create: function(data) {
    const that = this;
    return new Promise(function(resolve, reject) {
      // Validate input
      try {
        utils.validateData(data, {
          isRequired: false,
          params: {
            credentialToken: {
              type: "string"
            }
          }
        });
      } catch (error) {
        reject(error);
        return;
      }

      // Send request
      that._gateway
        .sendRequest("POST", "/sessions", data)
        .then(res => resolve(res))
        .catch(err => reject(err));
    });
  },

  /**
   * List a user's sessions
   * @arg { userId, limit, startingAfter, endingBefore  }
   * @return list
   */
  list: function(data) {
    const that = this;
    return new Promise(function(resolve, reject) {
      // Validate data
      try {
        utils.validateData(data, {
          isRequired: true,
          params: {
            userId: {
              type: "string",
              isRequired: true
            },
            limit: {
              type: "number"
            },
            startingAfter: {
              type: "string"
            },
            endingBefore: {
              type: "string"
            }
          }
        });
      } catch (error) {
        reject(error);
        return;
      }

      // Send request
      that._gateway
        .sendRequest("GET", "/sessions", data)
        .then(res => resolve(res))
        .catch(err => reject(err));
    });
  },

  /**
   * Retrieves a session
   * @arg id
   * @return session
   */
  retrieve: function(id) {
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
      const path = "/sessions/" + id;
      that._gateway
        .sendRequest("GET", path, null)
        .then(res => resolve(res))
        .catch(err => reject(err));
    });
  },

  /**
   * Revokes a session
   * @arg id
   * @arg { sessionToken }
   * @return session
   */
  revoke: function(id, data) {
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
            sessionToken: {
              type: "string",
              isRequired: true
            }
          }
        });
      } catch (error) {
        reject(error);
        return;
      }

      // Send request
      const path = "/sessions/" + id + "/revoke";
      that._gateway
        .sendRequest("POST", path, data)
        .then(res => resolve(res))
        .catch(err => reject(err));
    });
  },

  /**
   * Upgrades a session
   * @arg id
   * @arg { credentialToken }
   * @return session
   */
  upgrade: function(id, data) {
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
            }
          }
        });
      } catch (error) {
        reject(error);
        return;
      }

      // Send request
      const path = "/sessions/" + id + "/upgrade";
      that._gateway
        .sendRequest("POST", path, data)
        .then(res => resolve(res))
        .catch(err => reject(err));
    });
  },

  /**
   * Validates a session token
   * @arg { sessionToken }
   * @return session
   */
  validate: function(data) {
    const that = this;

    /**
     * Retrieves a public key
     * @arg id
     * @return publicKey
     */
    const getPublicKey = function(id) {
      return new Promise(function(resolve, reject) {
        // Check the cache
        const pubKey = that._cachedPublicKeys[id];
        if (!!pubKey) {
          resolve(pubKey);
          return;
        }

        // Send request
        var path = "/publicKeys/" + id;
        that._gateway
          .sendRequest("GET", path, null)
          .then(pubKey => {
            // Cache the key
            that._cachedPublicKeys[id] = pubKey;
            resolve(pubKey);
          })
          .catch(err => reject(err));
      });
    };

    return new Promise(function(resolve, reject) {
      // Validate input
      try {
        utils.validateData(data, {
          isRequired: true,
          params: {
            sessionToken: {
              type: "string",
              isRequired: true
            }
          }
        });
      } catch (error) {
        reject(error);
        return;
      }

      // Parse token locally
      that
        ._parseToken(data.sessionToken, getPublicKey)
        .then(session => {
          // If session is active, just resolve
          if (session.status === "active") {
            resolve(session);
            return;
          }

          // Send request
          const path = "/sessions/" + session.id + "/validate";
          that._gateway
            .sendRequest("POST", path, data)
            .then(res => resolve(res))
            .catch(err => reject(err));
        })
        .catch(err => reject(err));
    });
  }
};

module.exports = sessions;
