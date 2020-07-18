const { Gateway } = require("../gateway");
const { fetchCurrentState, updateCurrentState } = require("./database");
const getCurrentCredential = require("./currentCredential/get.js");
const newCurrentCredential = require("./newCurrentCredential.js");
const getCurrentUser = require("./currentUser/get.js");
const newCurrentUser = require("./newCurrentUser.js");

function FeatherClient(apiKey, config = {}) {
  if (!(this instanceof FeatherClient)) {
    return new FeatherClient(apiKey, config);
  }
  if (!window.indexedDB) {
    throw new Error(
      "Your browser does not support a stable version of IndexedDB. This means Feather's stateful client interface is not supported on this device. For help or more information, please contact us at hello@feather.id."
    );
  }
  this._gateway = Gateway(apiKey, config);

  if (process.env.NODE_ENV === "development")
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
    this.currentUser()
      .then(currentUser => observer(currentUser))
      .catch(e => {});
    return () => {
      this._unsubscribeObserver(observer);
    };
  };

  this.passwords = this._gateway.passwords;

  return this;
}

FeatherClient.prototype = {
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
        .then(() => {
          if (sessionStorage) {
            sessionStorage.setItem(
              "feather.currentUser.tokens.idToken",
              user ? user.tokens.idToken : null
            );
          }
          return that._notifyStateObservers();
        })
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

  /**
   * @private
   * This may be removed in the future.
   */
  _unsubscribeObserver(o) {
    this._onStateChangeObservers = this._onStateChangeObservers.filter(
      observer => observer !== o
    );
  }
};

module.exports = { FeatherClient };
module.exports.FeatherClient = FeatherClient;
module.exports.default = FeatherClient;
