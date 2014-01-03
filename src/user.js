/**
 * @fileoverview Simplified user object that looks like a Backbone model, but with only 'CHANGE'
 * and 'CLEAR' events.
 * Note that including this file will setup a global `window.livefyre.user`, but won't override
 * an existing object. Use at own risk.
 * This should be assumed to be a global singleton.
 */

var EventEmitter = require('event-emitter'),
    inherits = require('inherits'),
    jsonp = require('auth-delegates/util/jsonp'),
    storage = require('auth-delegates/util/storage'),
    AUTH_COOKIE_KEY = 'fyre-auth';

/**
 * @param {Object} initialAttr
 * @constructor
 */
function LivefyreUser(initialAttr) {
    this._attributes = LivefyreUser.getDefaults();
    EventEmitter.call(this);
}
inherits(LivefyreUser, EventEmitter);

/** @return {Object.<string, *>} */
LivefyreUser.getDefaults = function() {
    return {
        'modMap': {},
        'keys': []
    };
};

/** @enum {string} */
LivefyreUser.EVENTS = {
    CHANGE: 'change',
    LOGOUT: 'logout',
    LOGIN: 'login',
    LOGIN_REQUESTED: 'loginRequested'
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
        this.emit(LivefyreUser.EVENTS.CHANGE + ':' + k, val);
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
        this.emit(LivefyreUser.EVENTS.CHANGE + ':' + key, obj[key]);
    }
};

/** 
 * Clear all attributes back to defaults.
 */
LivefyreUser.prototype.logout = LivefyreUser.prototype.reset = function() {
    this._attributes = {};
    this.set(LivefyreUser.getDefaults());
    storage.remove(AUTH_COOKIE_KEY);
    this.emit(LivefyreUser.EVENTS.LOGOUT);
};

/**
 * Simply sets the token. It is up to the authentication delegates to invoke the "remoteLogin"
 * by listening to "change:token".
 * @param {string) token
 */
LivefyreUser.prototype.login = function(token) {
    this.set('token', token);
    this.emit(LivefyreUser.EVENTS.LOGIN_REQUESTED, token);
};

/**
 * @param {Object} data
 * @param {sting} collectionId
 */
LivefyreUser.prototype.loadSession = function(data, collectionId) {
    var profile = data['profile'],
        permissions = data['permissions'],
        authors = permissions['authors'],
        modKey = permissions['moderator_key'],
        tokenObj = data['token'],
        ttl = (+new Date()) + tokenObj['ttl'],
        keys = [modKey],
        existingKeys = this.get('keys');

    for (var i = 0; i < authors.length; i++) {
        keys.push(authors[i]['key']);
    }
    this.set(profile);
    this.set('keys', existingKeys.concat(keys));

    if (modKey) {
        var modMap = this.get('modMap');
        modMap[collectionId] = modKey;
        this.set('modMap', modMap);
    }

    this.emit(LivefyreUser.EVENTS.LOGIN, profile);
};

/**
 * @param {string} collectionId
 * @return {boolean}
 */
LivefyreUser.prototype.isMod = function(collectionId) {
    return collectionId in this.get('modMap');
};

/**
 * @param {string} collectionId
 * @param {string=} opt_serverUrl
 * @param {function()=} opt_callback
 */
LivefyreUser.prototype.remoteLogin = function(collectionId, opt_serverUrl, opt_callback) {
    var url = (opt_serverUrl || 'http://livefyre.com') + '/api/v3.0/auth/?collectionId=' + collectionId,
        self = this,
        token = this.get('token');

    url += token ? '&token=' + token : '';
    jsonp.req(url, function(err, resp) {
        if (err || (resp['data'] && !resp['data']['profile'])) {
            return;
        }
        var data = resp['data'],
            tokenObj = data['token'],
            ttl = (+new Date()) + tokenObj['ttl'];
        self.loadSession(data, collectionId);        
        storage.set(AUTH_COOKIE_KEY, data, ttl);
        opt_callback && opt_callback(data);
    });
};

/**
 * Set up global livefyre user object.
 */
window.Livefyre = window.Livefyre || {};
window.Livefyre.user = window.Livefyre.user || new LivefyreUser();
module.exports = window.Livefyre.user;
