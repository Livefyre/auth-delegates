var jsonp = require('auth-delegates/util/jsonp'),
    storage = require('auth-delegates/util/storage'),
    lfUser = require('auth-delegates/user'),
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
 * @param {function()} callback
 */
LivefyreDelegate.prototype.login = function(callback) {
    function success(response) {
        var data = response['data'],
            args = 'profile' in data ? [null, data] : ['`profile` not in data'];
        callback.apply(null, args);
        lfUser.fromProfile(data);
    }

    this._popup(function(err, data) {
        if (err) {
            callback(err);
            return;
        }
        success(data);
    });
};

/**
 * mmmmcookies
 * @param {function()} callback
 */
LivefyreDelegate.prototype.loadSession = function(callback) {
    var authData = storage.get(AUTH_COOKIE_KEY);
    if (authData) {
        callback(null, authData);
        return;
    }
    callback('No storage data found');
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
LivefyreDelegate.prototype.logout = function(callback) {
    var url = this._serverUrl + '/auth/logout/ajax/?nocache=' + (new Date()).getTime();
    jsonp.req(url, function(err, data) {
        callback.apply(null, arguments);
        lfUser.clear();
    });
};

LivefyreDelegate.prototype.viewProfile = function() {
    window.open(this._serverUrl + '/profile/', '_blank');
};

LivefyreDelegate.prototype.editProfile = function() {
    window.open(this._serverUrl + '/profile/edit/info/', '_blank');
};

module.exports = LivefyreDelegate;
