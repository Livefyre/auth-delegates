var bind = require('auth-delegates/util/bind'),
    jsonp = require('auth-delegates/util/jsonp'),
    storage = require('auth-delegates/util/storage'),
    user = require('auth-delegates/user'),
    userAgent = navigator.userAgent,
    IS_OPERA = userAgent.indexOf('Opera') > -1,
    AUTH_COOKIE_KEY = 'fyre-auth';

/**
 * @constructor
 */
function LivefyreDelegate() {
    this.collectionId = null;
    this.serverUrl = null;
    user.on('loginRequested', bind(this.fetchAuthData, this));
}

/**
 * Fire login popup, and on success login the user.
 */
LivefyreDelegate.prototype.login = function() {
    this._popup();
};

LivefyreDelegate.prototype.fetchAuthData = function() {
    if (!user.get('token')) {
        user.remoteLogin(this.collectionId, this.serverUrl);
    }
};

/**
 * To be invoked when collectionId is known.
 * @param {string} collectionId
 * @param {string} opt_serverUrl
 */
LivefyreDelegate.prototype.setCollection = function(collectionId, opt_serverUrl) {
    this.collectionId = collectionId;
    this.serverUrl = opt_serverUrl;
};

/**
 * mmmmcookies
 */
LivefyreDelegate.prototype.loadSession = function() {
    var cookieData = storage.get(AUTH_COOKIE_KEY) || {};
    if (cookieData['token']) {
        user.loadSession(cookieData);
    } else {
        storage.remove(AUTH_COOKIE_KEY);
    }
};

/**
 * @param {function()} callback
 * @private
 */
LivefyreDelegate.prototype._popup = function(callback) {
    var serverUrl = this.serverUrl,
        collectionId = this.collectionId,

        windowUrl = serverUrl + '/auth/popup/login/?collectionId=' + collectionId,
        popup = window.open(windowUrl, 'authWindow',
        'width=530;height=365;location=true;menubar=false;resizable=false;scrollbars=false'),

        timeout = setInterval(function() {
            testResult(callback, popup);
        }, 100);

    function isActive(popup) {
        if (!popup) {
            return false;
        }
        try {
            // Opera has a bug that changes popup.closed to undefined rather than true.
            return (popup.closed === false);
        } catch(e) {
            if (IS_OPERA) {
                return true;
            }
            throw e;
        }
    }

    function testResult(callback, popup) {
        if (!isActive(popup)) {
            clearInterval(timeout);
            user.remoteLogin(collectionId, serverUrl);
            return;
        }
    }
};

/**
 * @param {function()} callback
 */
LivefyreDelegate.prototype.logout = function() {
    var url = this.serverUrl + '/auth/logout/ajax/?nocache=' + (new Date()).getTime();
    jsonp.req(url, function(err, data) {
        if (!err) {
            user.logout();
        }
    });
};

LivefyreDelegate.prototype.viewProfile = function() {
    window.open(this._serverUrl + '/profile/', '_blank');
};

LivefyreDelegate.prototype.editProfile = function() {
    window.open(this._serverUrl + '/profile/edit/info/', '_blank');
};

LivefyreDelegate.prototype.destroy = function() {
    this.collectionId = null;
    this.serverUrl = null;
    user.removeListener('loginRequested', bind(this.fetchAuthData, this));
};

module.exports = LivefyreDelegate;
