/**
 * @fileoverview Simplified user object that looks like a Backbone model, but with only 'CHANGE'
 * and 'CLEAR' events.
 * Note that including this file will setup a global `window.livefyre.user`, but won't override
 * an existing object. Use at own risk.
 * This should be assumed to be a global singleton.
 */

var EventEmitter = require('event-emitter'),
    inherits = require('inherits');

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
    this._attributes = LivefyreUser.DEFAULTS;
    extend(this._attributes, initialAttr || {});
    EventEmitter.call(this);
}
inherits(LivefyreUser, EventEmitter);

/** @type {Object.<string, *>} */
LivefyreUser.DEFAULTS = {
    'mod': false,
    'keys': []
};

/** @enum {string} */
LivefyreUser.EVENTS = {
    CHANGE: 'change',
    CLEAR: 'clear'
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
 * Clear all attributes back to defaults.
 */
LivefyreUser.prototype.clear = function() {
    this._attributes = LivefyreUser.DEFAULTS;
    this.emit(LivefyreUser.EVENTS.CLEAR);
};

/**
 * From a auth response, set up the profile object.
 * @param {Object} profileObject
 */
LivefyreUser.prototype.fromProfile = function(profileObject) {
    var profile = profileObject['profile'],
        permissions = profileObject['permissions'],
        i,  
        authors = permissions['authors'],
        modKey = permissions['moderator_key'];
    profile['token'] = profileObject['token']['value'];
    profile['mod'] = !!modKey;
    profile['keys'] = [modKey];

    for (i = 0; i < authors.length; i++) {
        profile['keys'].push(authors[i]['key']);
    }
    this.set(profile);
};

/**
 * Set up global livefyre user object.
 */
window.livefyre = window.livefyre || {};
window.livefyre.user = window.livefyre.user || new LivefyreUser();
module.exports = window.livefyre.user;
