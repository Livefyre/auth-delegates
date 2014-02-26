/**
 * @fileoverview Remote auth delegate is the base for any custom implementations
 * of auth for Livefyre.
 */

var bind = require('auth-delegates/util/bind'),
    storage = require('auth-delegates/util/storage'),
    user = require('auth-delegates/user'),
    AUTH_COOKIE_KEY = 'fyre-auth';

/**
 * @param {string} articleId
 * @param {string} siteId
 * @param {string=} serverUrl
 * @constructor
 */
function RemoteAuthDelegate(articleId, siteId, serverUrl) {
  this.articleId = articleId;
  this.siteId = siteId;
  this.serverUrl = serverUrl;
  user.on('loginRequested', bind(this.fetchAuthData, this));
}

RemoteAuthDelegate.prototype.fetchAuthData = function() {
  user.remoteLogin({
      articleId: this.articleId,
      siteId: this.siteId,
      serverUrl: this.serverUrl
  });
};

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

// To be implemented by user
RemoteAuthDelegate.prototype.login = function() {};
RemoteAuthDelegate.prototype.viewProfile = function() {};
RemoteAuthDelegate.prototype.editProfile = function() {};

/**
 * Clean up any handlers, etc.
 */
RemoteAuthDelegate.prototype.destroy = function() {
  user.removeListener('loginRequested', bind(this.fetchAuthData, this));
};

module.exports = RemoteAuthDelegate;
