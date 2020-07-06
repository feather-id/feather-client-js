const { Gateway } = require("../gateway");
const { fetchCurrentState, updateCurrentState } = require("./database");
const getCurrentCredential = require("./currentCredential/get.js");
const newCurrentCredential = require("./newCurrentCredential.js");
const getCurrentUser = require("./currentUser/get.js");
const newCurrentUser = require("./newCurrentUser.js");
const onStateChange = require("./onStateChange.js");
const jws = require("jws");

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

  console.log("[Feather] initializing client");

  const that = this;
  fetchCurrentState()
    .then(state => {
      if (!state) {
        return updateCurrentState({
          credential: null,
          user: null
        });
      }
      return Promise.resolve();
    })
    .then(() => that._scheduleUserTokenRefresh())
    .catch(error => {
      console.log(error);
    });

  this.currentUser = () => getCurrentUser(this);
  this.currentCredential = () => getCurrentCredential(this);

  this.newCurrentCredential = params => newCurrentCredential(this, params);
  this.newCurrentUser = credentialToken =>
    newCurrentUser(this, credentialToken);

  this._onStateChangeObservers = [];
  this.onStateChange = observer => {
    this._onStateChangeObservers.push(observer);
    // TODO return "unsubscribe" function
    this.currentUser().then(currentUser => observer(currentUser));
  };

  this._refreshTimerId = null;

  this.passwords = this._gateway.passwords;

  return this;
}

Client.prototype = {
  /**
   * @private
   * This may be removed in the future.
   */
  _setCurrentCredential(credential) {
    return new Promise(function(resolve, reject) {
      fetchCurrentState()
        .then(state => {
          state.credential = credential;
          return updateCurrentState(state);
        })
        .then(() => resolve())
        .catch(error => {});
    });
  },

  /**
   * @private
   * This may be removed in the future.
   */
  _setCurrentUser(user) {
    const that = this;
    return new Promise(function(resolve, reject) {
      fetchCurrentState()
        .then(state => {
          state.user = user;
          return updateCurrentState(state);
        })
        .then(() => that._notifyStateObservers())
        .then(() => that._scheduleUserTokenRefresh())
        .then(() => resolve())
        .catch(error => {});
    });
  },

  /**
   * @private
   * This may be removed in the future.
   */
  _notifyStateObservers() {
    const that = this;
    return new Promise(function(resolve, reject) {
      that
        .currentUser()
        .then(currentUser => {
          that._onStateChangeObservers.forEach(observer =>
            observer(currentUser)
          );
          resolve();
        })
        .catch(error => reject(error));
    });
  },

  _scheduleUserTokenRefresh() {
    const that = this;
    return new Promise(function(resolve, reject) {
      that
        .currentUser()
        .then(currentUser => {
          if (currentUser) {
            if (currentUser.tokens.idToken) {
              const decodedToken = jws.decode(currentUser.tokens.idToken);
              const expiresAt = new Date(decodedToken.payload.exp * 1000);
              const ms = Math.max(
                0,
                Math.abs(expiresAt - new Date()) - 30 * 1000 // 30s before expiration
              );
              if (that._refreshTimerId) {
                clearTimeout(that._refreshTimerId);
                that._refreshTimerId = null;
              }
              that._refreshTimerId = setTimeout(currentUser.refreshTokens, ms);
            }
          }
          resolve();
        })
        .catch(error => reject(error));
    });
  }
};

module.exports = { Client };
module.exports.Client = Client;
module.exports.default = Client;
