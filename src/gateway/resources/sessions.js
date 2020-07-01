const utils = require("../utils");
const parseToken = require("../parseToken");
const {
  FeatherError,
  FeatherErrorType,
  FeatherErrorCode
} = require("../../errors");

const sessions = {
  _gateway: null,
  _parseToken: parseToken,
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
      that._httpGateway
        .sendRequest("POST", "/sessions", data)
        .then(res => resolve(res))
        .catch(err => reject(err));
    });
  },

  /**
   * Retrieves a session
   * @arg id
   * @return session
   */
  // retrieve: function(id) {
  //   const that = this;
  //   return new Promise(function(resolve, reject) {
  //     // Validate input
  //     if (typeof id !== "string") {
  //       reject(
  //         new FeatherError({
  //           type: FeatherErrorType.VALIDATION,
  //           code: FeatherErrorCode.PARAMETER_INVALID,
  //           message: `expected param 'id' to be of type 'string'`
  //         })
  //       );
  //       return;
  //     }
  //     if (!that._xFeatherSession) {
  //       reject(
  //         new FeatherError({
  //           type: FeatherErrorType.VALIDATION,
  //           code: FeatherErrorCode.HEADER_MISSING,
  //           message: `This method requires an 'x-feather-session' header. Please use the 'setXFeatherSessionHeader' convenience method to provide valid session token for authorizing this request.`
  //         })
  //       );
  //     }
  //     const headers = { "x-feather-session": that._xFeatherSession };
  //
  //     // Send request
  //     const path = "/sessions/" + id;
  //     that._httpGateway
  //       .sendRequest("GET", path, null, headers)
  //       .then(res => resolve(res))
  //       .catch(err => reject(err));
  //   });
  // },

  /**
   * TODO pass in a refresh token
   *
   * Revokes a session
   * @arg id
   * @return session
   */
  revoke: function(id) {
    const that = this;
    return new Promise(function(resolve, reject) {
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
      // if (!that._xFeatherSession) {
      //   reject(
      //     new FeatherError({
      //       type: FeatherErrorType.VALIDATION,
      //       code: FeatherErrorCode.HEADER_MISSING,
      //       message: `This method requires an 'x-feather-session' header. Please use the 'setXFeatherSessionHeader' convenience method to provide valid session token for authorizing this request.`
      //     })
      //   );
      // }
      // const headers = { "x-feather-session": that._xFeatherSession };

      // Send request
      const path = "/sessions/" + id + "/revoke";
      that._httpGateway
        .sendRequest("POST", path, null, headers)
        .then(res => resolve(res))
        .catch(err => reject(err));
    });
  }

  /**
   * Updates a session
   * @arg id
   * @arg { credentialToken }
   * @return session
   */
  // update: function(id, data) {
  //   const that = this;
  //   return new Promise(function(resolve, reject) {
  //     // Validate input
  //     if (typeof id !== "string") {
  //       reject(
  //         new FeatherError({
  //           type: FeatherErrorType.VALIDATION,
  //           code: FeatherErrorCode.PARAMETER_INVALID,
  //           message: `expected param 'id' to be of type 'string'`
  //         })
  //       );
  //       return;
  //     }
  //     try {
  //       utils.validateData(data, {
  //         isRequired: true,
  //         params: {
  //           credentialToken: {
  //             type: "string",
  //             isRequired: true
  //           }
  //         }
  //       });
  //     } catch (error) {
  //       reject(error);
  //       return;
  //     }
  //     if (!that._xFeatherSession) {
  //       reject(
  //         new FeatherError({
  //           type: FeatherErrorType.VALIDATION,
  //           code: FeatherErrorCode.HEADER_MISSING,
  //           message: `This method requires an 'x-feather-session' header. Please use the 'setXFeatherSessionHeader' convenience method to provide valid session token for authorizing this request.`
  //         })
  //       );
  //     }
  //     const headers = { "x-feather-session": that._xFeatherSession };
  //
  //     // Send request
  //     const path = "/sessions/" + id;
  //     that._httpGateway
  //       .sendRequest("POST", path, data, headers)
  //       .then(res => resolve(res))
  //       .catch(err => reject(err));
  //   });
  // },

  /**
   * TODO "session tokens" aren't a thing anymore. Replace with an "ID token" validation function
   *
   * Validates a session token
   * @arg sessionToken
   * @return session
   */
  // validate: function(sessionToken) {
  //   const that = this;
  //
  //   /**
  //    * Retrieves a public key
  //    * @arg id
  //    * @return publicKey
  //    */
  //   const getPublicKey = function(id) {
  //     return new Promise(function(resolve, reject) {
  //       // Check the cache
  //       const pubKey = that._cachedPublicKeys[id];
  //       if (!!pubKey) {
  //         resolve(pubKey);
  //         return;
  //       }
  //
  //       // Send request
  //       var path = "/publicKeys/" + id;
  //       that._httpGateway
  //         .sendRequest("GET", path, null)
  //         .then(pubKey => {
  //           // Cache the key
  //           that._cachedPublicKeys[id] = pubKey;
  //           resolve(pubKey);
  //         })
  //         .catch(err => reject(err));
  //     });
  //   };
  //
  //   return new Promise(function(resolve, reject) {
  //     // Validate input
  //     if (typeof sessionToken !== "string") {
  //       reject(
  //         new FeatherError({
  //           type: FeatherErrorType.VALIDATION,
  //           code: FeatherErrorCode.PARAMETER_INVALID,
  //           message: `expected param 'sessionToken' to be of type 'string'`
  //         })
  //       );
  //       return;
  //     }
  //
  //     // Parse token locally
  //     that
  //       ._parseToken(sessionToken, getPublicKey)
  //       .then(session => resolve(session))
  //       .catch(err => reject(err));
  //   });
  // }
};

module.exports = sessions;
