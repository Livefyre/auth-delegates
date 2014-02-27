var base64 = require('base64'),
    bind = require('auth-delegates/util/bind'),
    jsonp = require('auth-delegates/util/jsonp'),
    user = require('auth-delegates/user'),
    userAgent = navigator.userAgent,
    IS_OPERA = userAgent.indexOf('Opera') > -1;

/**
 * @param {string} articleId
 * @param {string} siteId
 * @param {string} serverUrl
 * @constructor
 */
function LivefyreDelegate(articleId, siteId, serverUrl) {
    this.articleId = base64.btoa(articleId);
    this.siteId = siteId;
    this.serverUrl = serverUrl;
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
        user.remoteLogin({
            articleId: this.articleId,
            siteId: this.siteId,
            serverUrl: this.serverUrl
        });
    }
};

/**
 * @param {function()} callback
 * @private
 */
LivefyreDelegate.prototype._popup = function(callback) {
    var serverUrl = this.serverUrl,
        articleId = this.articleId,
        siteId = this.siteId,

        windowUrl = serverUrl + '/auth/popup/login/?articleId=' + articleId + '&siteId=' + siteId,
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
            user.remoteLogin({
                articleId: articleId,
                siteId: siteId,
                serverUrl: serverUrl
            });
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

/**
 * @param {Object} author
 */
LivefyreDelegate.prototype.viewProfile = function(author) {
    window.open(author.profileUrl, '_blank');
};

LivefyreDelegate.prototype.editProfile = function() {
    window.open(this._serverUrl + '/profile/edit/info/', '_blank');
};

/**
 * Clean up any handlers, etc.
 */
LivefyreDelegate.prototype.destroy = function() {
    this.articleId = this.siteId = this.serverUrl = null;
    user.removeListener('loginRequested', bind(this.fetchAuthData, this));
};

module.exports = LivefyreDelegate;
