/**
 * @fileoverview Backplane auth delegate. Note the differences in implementation between 1.2 and 2.0
 * versions of Backplane.
 */
var base64 = require('base64'),
    bind = require('auth-delegates/util/bind'),
    jsonp = require('auth-delegates/util/jsonp'),
    md5 = require('md5'),
	storage = require('auth-delegates/util/storage'),
	user = require('auth-delegates/user'),
	AUTH_COOKIE_KEY = 'fyre-auth',
    BACKPLANE_CACHE_KEY = 'fyre-backplane-cache',
    BP_MSG_TYPES = {
        LOGIN: 'identity/login',
        LOGOUT: 'identity/logout'
    },
    USER_BP_KEY = 'bpChannel',
    VERSIONS = {
        v12: /1\.2\.[0-9]/,
        v20: /2\.0\.[0-9]/
    };

/**
 * Handles caching of Backplane + user information for easy session retrieval 
 */
var cache = {
    /**
     * Check the Backplane cache for a hit.
     * @param {Object} message Backplane message to add to cache.
     * @return {boolean} Whether we have a cache hit.
     */
    has: function(message) {
        var bpChannel = message['messageURL'] || user.get(USER_BP_KEY);
        var checksum = md5(JSON.stringify(message));
        var data = storage.get(BACKPLANE_CACHE_KEY);
        return data && bpChannel === data['channel'] && checksum === data['checksum'];
    },

    /**
     * Set the current message in the Backplane cache
     * @param {Object} message Backplane message to add to cache.
     */
    set: function(message) {
        var bpChannel = message['messageURL'] || user.get(USER_BP_KEY);
        var checksum = md5(JSON.stringify(message));
        storage.set(BACKPLANE_CACHE_KEY, {
            'channel': bpChannel,
            'checksum': checksum
        });
    },

    remove: function() {
        storage.remove(BACKPLANE_CACHE_KEY);
    }
};

/**
 * Get first matching message in reverse order. This is necesary because the user could have
 * logged in and out multiple times. We desire the latest message.
 * @param  {Array.<Object>} messages
 * @return {?Object}
 */
function extractLastMessage(messages) {
    var message, type, i = messages.length;

    while (i--) {
        message = messages[i];
        type = message['type'] || (message['message'] || {})['type'];
        if (type === BP_MSG_TYPES.LOGIN || type === BP_MSG_TYPES.LOGOUT) {
            return message;
        }
    }
    return null;
}


/**
 * Backplane 1.2 logic.
 * See: https://sites.google.com/site/backplanespec/documentation/backplane1-2
 * Also: http://developers.janrain.com/documentation/backplane-protocol/addtoyourwebsite/legacy-backplane-1x/
 * Upon page load fetch existing Backplane message from the bus.
 * This is the case in which the user is currently logged in, but
 * has navigated to a new page.
 * Uses the channel if set on the Livefyre.user model.
 * @param {Backplane} backplane
 * @param {Function()} handleMessage
 */
function backendv12(backplane, handleMessage) {
    var bpChannel = window.Backplane.getChannelID() || null;

    function handler(message) {
        user.set(USER_BP_KEY, bpChannel);
        handleMessage(message);
    }

    backplane.subscribe(handler);
    jsonp.req(bpChannel, function(err, data) {
        if (err) {
            return;
        }
        if (!data.length) {
            return;
        }
        var message = extractLastMessage(data);
        message && handler(message['message']);
    });
}

/**
 * Backplane 2.0 logic.
 * See: http://developers.janrain.com/documentation/backplane-protocol/addtoyourapplication/backplane-2-0/
 * @param {Backplane} backplane
 * @param {Function()} handleMessage
 */
function backendv20(backplane, handleMessage) {
    function handler(message) {
        user.set(USER_BP_KEY, message['messageURL']);
        handleMessage(message);
    }

    backplane.subscribe(handler);
    // Replay historic messages - this is how we will be notified of
    // identity events during a page refresh/redirect.
    var cachedMessages = backplane.getCachedMessages();
    if (cachedMessages.length) {
        // Priority is given to (more) recent messages
        var message = extractLastMessage(cachedMessages);
        if (message) {
            handler(message);
        }
    }
}

/**
 * @param {Backplane} backplane
 * @param {Function()} handleMessage
 */
function setSubscriptionByVersion(backplane, handleMessage) {
    var version = backplane.version;
    if (VERSIONS.v12.test(version)) {
        return backendv12(backplane, handleMessage);
    } else if (VERSIONS.v20.test(version)) {
        return backendv20(backplane, handleMessage);
    }
    throw 'Backplane delegate is only compatible with version 1.2 and 2.0 of Backplane';
}

/**
 * @param {string} articleId
 * @param {string} siteId
 * @param {string} serverUrl
 * @constructor
 */
function BackplaneDelegate(articleId, siteId, serverUrl) {
	if (!window.Backplane) {
		throw 'backplane instance must exist';
	}

    this.articleId = base64.btoa(articleId);
    this.siteId = siteId;
    this.serverUrl = serverUrl;

    // only call init once
    var bp = window.Backplane;
    var self = this;
    var initOnce = false;
    var callback = function() {
        self.currentBPChannel = bp.getChannelID() || null;
        setSubscriptionByVersion(bp, bind(self.handleBackplaneMessage, self));
        initOnce = true;
    };

    bp(function() {
        initOnce || callback();
    });
}

/**
 * Based on message type, takes a certain action.
 * @param {Object} message
 */
BackplaneDelegate.prototype.handleBackplaneMessage = function(message) {
    var messageType = message['type'];
    switch (messageType) {
        case BP_MSG_TYPES.LOGIN:
            if (cache.has(message)) {
                this.loadSession();
                break;
            }
            cache.set(message);
            user.remoteLogin({
                siteId: this.siteId,
                articleId: this.articleId,
                serverUrl: this.serverUrl
            });
            break;
        case BP_MSG_TYPES.LOGOUT:
            user.logout();
            break;
        default:
            throw 'This Backplane message type is not supported: ' + messageType;
    }
};

BackplaneDelegate.prototype.loadSession = function() {
    var cookieData = storage.get(AUTH_COOKIE_KEY) || {};
    if (cookieData['token']) {
        user.loadSession(cookieData);
    } else {
        storage.remove(AUTH_COOKIE_KEY);
    }
};

/**
 * As Backplane.resetCookieChannel spawns an async task to reset
 * the channel, poll and logout when the channel updates or after 5 seconds.
 */
BackplaneDelegate.prototype.logout = function() {
    var timeout, count = 0, self = this;
    function poll() {
        // A request to reset Backplane is handled asynchronoulsy via JSONP,
        // so we need to poll until the Backplane channel is reset, i.e. not
        // equal to the value we have stored on the class (and not falsy too).
        var bpChannelId = self.backplane.getChannelID();
        var isUpdated = bpChannelId && self.currentBPChannel !== bpChannelId;

        clearTimeout(timeout);

        if (isUpdated || count === 50) {
            cache.remove();
            self.currentBPChannel = self.backplane.getChannelID();
            return;
        }
        timeout = setTimeout(poll, 100);
    }

    poll();
	user.logout();
};

BackplaneDelegate.prototype.login = function() {};
BackplaneDelegate.prototype.viewProfile = function() {};
BackplaneDelegate.prototype.editProfile = function() {};

/**
 * Clean up any handlers, etc.
 */
BackplaneDelegate.prototype.destroy = function() {
    this.articleId = this.siteId = this.serverUrl = this.currentBPChannel = null;
};

module.exports = BackplaneDelegate;
