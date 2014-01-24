/**
 * @fileoverview Remote auth delegate is the base for any custom implementations
 * of auth for Livefyre.
 */

var storage = require('auth-delegates/util/storage'),
    user = require('auth-delegates/user'),
    AUTH_COOKIE_KEY = 'fyre-auth';

/**
 * @constructor
 */
function RemoteAuthDelegate() {}

RemoteAuthDelegate.prototype.loadSession = function() {
    var cookieData = storage.get(AUTH_COOKIE_KEY) || {};
    if (cookieData['token']) {
        user.loadSession(cookieData);
    } else {
        storage.remove(AUTH_COOKIE_KEY);
    }
};

RemoteAuthDelegate.prototype.logout = function() {
    user.logout();
};

// To be implemented by usef
RemoteAuthDelegate.prototype.login = function() {};
RemoteAuthDelegate.prototype.viewProfile = function() {};
RemoteAuthDelegate.prototype.editProfile = function() {};

/**
 * Clean up any handlers, etc.
 */
RemoteAuthDelegate.prototype.destroy = function() {};

module.exports = RemoteAuthDelegate;
