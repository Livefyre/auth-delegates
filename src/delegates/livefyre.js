var jsonp = require('auth-delegates/util/jsonp'),
    storage = require('auth-delegates/util/storage'),
    user = require('auth-delegates/user'),
    userAgent = navigator.userAgent,
    IS_OPERA = userAgent.indexOf('Opera') > -1,
    AUTH_COOKIE_KEY = 'fyre-auth';

/**
 * @param {string|number} collectionId
 * @param {string} serverUrl
 * @constructor
 */
function LivefyreDelegate(collectionId, serverUrl) {
    this._collectionId = collectionId;
    this._serverUrl = serverUrl;
}

/**
 * Login
 */
LivefyreDelegate.prototype.login = function() {
    this._popup(function(err, resp) {
        if (err || resp['status'] === 'error') {
            return;
        }
        user.login(resp['data']);
    });
};

/**
 * mmmmcookies
 */
LivefyreDelegate.prototype.loadSession = function() {
    var cookieData = storage.get(AUTH_COOKIE_KEY) || {};
    if (cookieData['token'] === token) {
        user.login(cookieData);
    } else {
        storage.remove(AUTH_COOKIE_KEY);
        user.set('token', token);
    }
};

/**
 * @param {function()} callback
 * @private
 */
LivefyreDelegate.prototype._popup = function(callback) {
    var serverUrl = this._serverUrl,
        collectionId = this._collectionId,

        windowUrl = serverUrl + '/auth/popup/login/?collectionId=' + collectionId,
        popup = window.open(windowUrl, 'authWindow',
        'width=530;height=365;location=true;menubar=false;resizable=false;scrollbars=false'),

        timeout = setInterval(function() {
            testResult(callback, popup);
        }, 100);


    function fetchAuthData(callback) {
        var url = serverUrl + '/api/v3.0/auth/?collectionId=' + collectionId;
        jsonp.req(url, callback);
    }

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
            fetchAuthData(callback);
            return;
        }
    }
};

/**
 * @param {function()} callback
 */
LivefyreDelegate.prototype.logout = function() {
    var url = this._serverUrl + '/auth/logout/ajax/?nocache=' + (new Date()).getTime();
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

module.exports = LivefyreDelegate;
