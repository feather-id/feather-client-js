const { Gateway } = require("../gateway");
const { fetchCurrentState, updateCurrentState } = require("./database");
const getCurrentCredential = require("./currentCredential/get.js");
const newCurrentCredential = require("./newCurrentCredential.js");
const getCurrentUser = require("./currentUser/get.js");
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

  console.log("[Feather] initializing client");

  fetchCurrentState()
    .then(state => {
      if (!state) {
        updateCurrentState({
          credential: null,
          user: null
        });
      }
    })
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
  }
};

module.exports = { Client };
module.exports.Client = Client;
module.exports.default = Client;
