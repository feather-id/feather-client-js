module.exports = function onStateChange(observer) {
  this._onStateChangeObservers.push(observer)
  // TODO return "unsubscribe" function
}
