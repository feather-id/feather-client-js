const { Gateway } = require("../gateway");
const { fetchCurrentState, updateCurrentState } = require("./database");
const currentCredentialUpdate = require("./currentCredential/update.js");
const currentUserRefreshTokens = require("./currentUser/refreshTokens.js");
const currentUserRevokeTokens = require("./currentUser/revokeTokens.js");
const currentUserUpdate = require("./currentUser/update.js");
const currentUserUpdateEmail = require("./currentUser/updateEmail.js");
const currentUserUpdatePassword = require("./currentUser/updatePassword.js");
const newCurrentCredential = require("./newCurrentCredential.js");
const newCurrentUser = require("./newCurrentUser.js");
const onStateChange = require("./onStateChange.js");

function Client(apiKey, config = {}) {
  if (!(this instanceof Client)) {
    return new Client(apiKey, config);
  }
  if (!window.indexedDB) {
    throw new Error(
      "Your browser does not support a stable version of IndexedDB. This means Feather's stateful client interface is not supported on this device. For help or more information, please contact us at hello@feather.id."
    );
  }
  this._gateway = Gateway(apiKey, config);

  fetchCurrentState()
    .then(state => {
      if (!state) {
        updateCurrentState({
          credential: null,
          user: null
        });
        this._notifyStateObservers();
      } else {
        this._setCurrentCredential(state.credential);
        this._setCurrentUser(state.user);
      }
    })
    .catch(error => {
      console.log(error);
    });

  this._onStateChangeObservers = [];
  this.onStateChange = onStateChange;
  this.newCurrentCredential = params => newCurrentCredential(this, params);
  this.newCurrentUser = credentialToken =>
    newCurrentUser(this, credentialToken);

  return this;
}

Client.prototype = {
  /**
   * @private
   * This may be removed in the future.
   */
  _setCurrentCredential(credential) {
    this.currentCredential = {
      ...credential,
      update: params => currentUserUpdate(this, params)
    };

    fetchCurrentState()
      .then(state => {
        state.credential = credential;
        return updateCurrentState(state);
      })
      .catch(error => {});

    return this.currentCredential;
  },

  /**
   * @private
   * This may be removed in the future.
   */
  _setCurrentUser(user) {
    this.currentUser = {
      ...user,
      refreshTokens: () => currentUserRefreshTokens(this),
      revokeTokens: () => currentUserRevokeTokens(this),
      update: params => currentUserUpdate(this, params),
      updateEmail: (newEmail, credentialToken) =>
        currentUserUpdateEmail(this, newEmail, credentialToken),
      updatePassword: (newPassword, credentialToken) =>
        currentUserUpdatePassword(this, newPassword, credentialToken)
    };

    fetchCurrentState()
      .then(state => {
        state.user = user;
        return updateCurrentState(state);
      })
      .then(() => this._notifyStateObservers())
      .catch(error => {});

    return this.currentUser;
  },

  /**
   * @private
   * This may be removed in the future.
   */
  _notifyStateObservers() {
    this._onStateChangeObservers.forEach(observer =>
      observer(this.currentUser)
    );
  }
};

module.exports = { Client };
module.exports.Client = Client;
module.exports.default = Client;
