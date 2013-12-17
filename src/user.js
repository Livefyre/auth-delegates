/**
 * @fileoverview Simplified user object that looks like a Backbone model, but with only 'CHANGE'
 * and 'CLEAR' events.
 * Note that including this file will setup a global `window.livefyre.user`, but won't override
 * an existing object. Use at own risk.
 * This should be assumed to be a global singleton.
 */

var EventEmitter = require('event-emitter'),
    inherits = require('inherits'),
    storage = require('auth-delegates/util/storage'),
    AUTH_COOKIE_KEY = 'fyre-auth';

/**
 * Simple extends function. Operates in place
 * @param {Object} target
 * @param {...Object} var_args
 */
function extend(target, var_args) {
    var key, source, i;
    for (i = 1; i < arguments.length; i++) {
        source = arguments[i];
        for (key in source) {
            target[key] = source[key];
        }
    }
}

/**
 * @param {Object} initialAttr
 * @constructor
 */
function LivefyreUser(initialAttr) {
    this._attributes = LivefyreUser.getDefaults();
    extend(this._attributes, initialAttr || {});
    EventEmitter.call(this);
}
inherits(LivefyreUser, EventEmitter);

/** @return {Object.<string, *>} */
LivefyreUser.getDefaults = function() {
    return {
        'mod': false,
        'keys': []
    };
};

/** @enum {string} */
LivefyreUser.EVENTS = {
    CHANGE: 'change',
    LOGOUT: 'logout',
    LOGIN: 'login'
};

/**
 * @param {Object|string} keyOrObj
 * @param {*=} opt_value
 */
LivefyreUser.prototype.set = function(keyOrObj, opt_value) {
    var tempKey, k, val;
    // Assume object if not string
    if (typeof(keyOrObj) === 'string') {
        tempKey = keyOrObj;
        keyOrObj = {};
        keyOrObj[tempKey] = opt_value;
    }

    for (k in keyOrObj) {
        val = keyOrObj[k];
        this._attributes[k] = val;
    }
    this.emit(LivefyreUser.EVENTS.CHANGE, keyOrObj);
};

/**
 * Get a particular attribute
 * @param {string} key
 * @return {*}
 */
LivefyreUser.prototype.get = function(key) {
    return this._attributes[key];
};

/**
 * @param {string} key
 */
LivefyreUser.prototype.unset = function(key) {
    if (key in this._attributes) {
        delete this._attributes[key];
        var obj = {};
        obj[key] = void 0;
        this.emit(LivefyreUser.EVENTS.CHANGE, obj);
    }
};

/** 
 * Clear all attributes back to defaults.
 */
LivefyreUser.prototype.logout = LivefyreUser.prototype.reset = function() {
    this._attributes = LivefyreUser.getDefaults();
    storage.remove(AUTH_COOKIE_KEY);
    this.emit(LivefyreUser.EVENTS.LOGOUT);
};

/**
 * From a auth response, set up the profile object (or a token). The following things happen:
 *  - Parse data
 *  - Save token and profile in storage
 *  - Trigger login event
 * @param {Object|string) profileOrToken
 */
LivefyreUser.prototype.login = function(profileOrToken) {
    if (typeof profileOrToken !== 'string') {
        var profile = profileOrToken['profile'],
            permissions = profileOrToken['permissions'],
            authors = permissions['authors'],
            modKey = permissions['moderator_key'],
            tokenObj = profileOrToken['token'],
            ttl = (+new Date()) + tokenObj['ttl'];

        profile['token'] = tokenObj['value'];
        profile['mod'] = !!modKey;
        profile['keys'] = [modKey];

        for (var i = 0; i < authors.length; i++) {
            profile['keys'].push(authors[i]['key']);
        }

        storage.set(AUTH_COOKIE_KEY, profileOrToken, ttl);
        this.set(profile);
    } else {
        this.set('token', profileOrToken);
    }

    this.emit(LivefyreUser.EVENTS.LOGIN);
};

/**
 * Set up global livefyre user object.
 */
window.livefyre = window.livefyre || {};
window.livefyre.user = window.livefyre.user || new LivefyreUser();
module.exports = window.livefyre.user;
