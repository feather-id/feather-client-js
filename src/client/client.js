const { Gateway } = require("../gateway");
const { fetchCurrentState, updateCurrentState } = require("./database");
const confirmEmailVerificationLink = require("./confirmEmailVerificationLink.js");
const confirmForgotPasswordLink = require("./confirmForgotPasswordLink.js");
const confirmSignInLink = require("./confirmSignInLink.js");
const confirmUpdateEmailLink = require("./confirmUpdateEmailLink.js");
const currentSession = require("./currentSession.js");
const onStateChange = require("./onStateChange.js");
const sendEmailVerificationLink = require("./sendEmailVerificationLink.js");
const sendForgotPasswordLink = require("./sendForgotPasswordLink.js");
const sendSignInLink = require("./sendSignInLink.js");
const sendUpdateEmailLink = require("./sendUpdateEmailLink.js");
const signIn = require("./signIn.js");
const signInAnonymously = require("./signInAnonymously.js");
const signOut = require("./signOut.js");
const updateUser = require("./updateUser.js");
const updateUserEmail = require("./updateUserEmail.js");
const updateUserPassword = require("./updateUserPassword.js");

export function Client(apiKey, config = {}) {
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
          session: null,
          user: null
        });
      }
      this._notifyStateObservers();
    })
    .catch(error => {
      console.log(error);
    });

  this._onStateChangeObservers = [];
  var that = this;
  this._notifyStateObservers = function() {
    fetchCurrentState().then(state => {
      that._onStateChangeObservers.forEach(observer =>
        observer(state.session, state.user)
      );
    });
  };
  this.confirmEmailVerificationLink = confirmEmailVerificationLink;
  this.confirmForgotPasswordLink = confirmForgotPasswordLink;
  this.confirmSignInLink = confirmSignInLink;
  this.confirmUpdateEmailLink = confirmUpdateEmailLink;
  this.currentSession = currentSession;
  this.onStateChange = onStateChange;
  this.sendEmailVerificationLink = sendEmailVerificationLink;
  this.sendForgotPasswordLink = sendForgotPasswordLink;
  this.sendSignInLink = sendSignInLink;
  this.sendUpdateEmailLink = sendUpdateEmailLink;
  this.signIn = signIn;
  this.signInAnonymously = signInAnonymously;
  this.signOut = signOut;
  this.updateUser = updateUser;
  this.updateUserEmail = updateUserEmail;
  this.updateUserPassword = updateUserPassword;
  return this;
}
