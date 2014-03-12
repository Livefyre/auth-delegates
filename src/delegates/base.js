/**
 * @fileoverview Base auth delegate
 */
var user = require('auth-delegates/user');

/**
 * @constructor
 */
function Delegate() {}

/** @private */
Delegate.prototype._user = user;

/**
 * @return {user}
 */
Delegate.prototype.getUser = function() {
  return this._user;
};

/**
 * @param {Object}
 */
Delegate.prototype.setUser = function(user) {
  this._user = user;
};

Delegate.prototype.restoreSession = function() {};
Delegate.prototype.viewProfile = function() {};
Delegate.prototype.editProfile = function() {};
Delegate.prototype.login = function() {};
Delegate.prototype.logout = function() {};
Delegate.prototype.destroy = function() {};

module.exports = Delegate;
