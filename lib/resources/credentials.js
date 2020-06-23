"use strict";

const credentialTypes = require("../credentialTypes");
const utils = require("../utils");
const FeatherError = require("../errors/featherError");
const ErrorType = require("../errors/errorType");
const ErrorCode = require("../errors/errorCode");

const credentials = {
  _gateway: null,

  /**
   * Creates a credential
   * @arg { type, email, username, password }
   * @return credential
   */
  create: function(data) {
    const that = this;
    return new Promise(function(resolve, reject) {
      // Validate input
      try {
        utils.validateData(data, {
          isRequired: false,
          params: {
            type: {
              type: "string",
              isRequired: true
            },
            email: {
              type: "string"
            },
            username: {
              type: "string"
            },
            password: {
              type: "string"
            },
            templateName: {
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
        .sendRequest("POST", "/credentials", data)
        .then(res => resolve(res))
        .catch(err => reject(err));
    });
  },

  /**
   * Updates a credential
   * @arg id
   * @arg { one_time_code }
   * @return the updated credential
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
            verificationCode: {
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
      const path = "/credentials/" + id;
      that._gateway
        .sendRequest("POST", path, data)
        .then(res => resolve(res))
        .catch(err => reject(err));
    });
  }
};

module.exports = credentials;
