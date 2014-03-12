/**
 * @fileoverview Remote auth delegate is the base for any custom implementations
 * of auth for Livefyre.
 */

var base64 = require('base64'),
    BaseDelegate = require('auth-delegates/delegates/base'),
    bind = require('auth-delegates/util/bind'),
    inherits = require('inherits'),
    storage = require('auth-delegates/util/storage'),
    user = require('auth-delegates/user'),
    AUTH_COOKIE_KEY = 'fyre-auth',
    AUTH_CREDS = 'fyre-authentication-creds';

/**
 * @param {string} articleId
 * @param {string} siteId
 * @param {string=} serverUrl
 * @constructor
 * @extends {BaseDelegate}
 */
function RemoteAuthDelegate(articleId, siteId, serverUrl) {
  this.articleId = base64.btoa(articleId);
  this.siteId = siteId;
  this.serverUrl = serverUrl;
  user.on('loginRequested', bind(this.fetchAuthData, this));
  BaseDelegate.call(this);
}
inherits(RemoteAuthDelegate, BaseDelegate);

RemoteAuthDelegate.prototype.fetchAuthData = function() {
  this.restoreSession();

  if (user.isAuthenticated()) {
    return;
  }

  user.remoteLogin({
      articleId: this.articleId,
      siteId: this.siteId,
      serverUrl: this.serverUrl
  });
};

RemoteAuthDelegate.prototype.logout = function() {
    user.logout();
};

/**
 * @param {Object} author
 */
RemoteAuthDelegate.prototype.viewProfile = function(author) {
  author.profileUrl && window.open(author.profileUrl, '_blank');
};

RemoteAuthDelegate.prototype.restoreSession = function() {
  var cookieData = storage.get(AUTH_COOKIE_KEY) || {};
  var creds = storage.get(AUTH_CREDS) || '';
  var token = user.get('token');

  if (cookieData['token'] && creds === token) {
      user.loadSession(cookieData);
  } else {
      storage.remove(AUTH_COOKIE_KEY);
  }
};

/**
 * Clean up any handlers, etc.
 */
RemoteAuthDelegate.prototype.destroy = function() {
  user.removeListener('loginRequested', bind(this.fetchAuthData, this));
};

module.exports = RemoteAuthDelegate;
