/**
 * @fileoverview Base auth delegate
 */
var user = require('auth-delegates/user');

/**
 * @constructor
 */
function Delegate() {}

Delegate.prototype.user = user;

/**
 * @return {user}
 */
Delegate.prototype.getUser = function() {
  return this.user;
};

Delegate.prototype.restoreSession = function() {};
Delegate.prototype.viewProfile = function() {};
Delegate.prototype.editProfile = function() {};
Delegate.prototype.login = function() {};
Delegate.prototype.logout = function() {};
Delegate.prototype.destroy = function() {};

module.exports = Delegate;
