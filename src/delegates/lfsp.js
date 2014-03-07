/** @fileoverview Livefyre Simple Profiles authentication delegate */

var base64 = require('base64'),
    user = require('../user'),
	useragent = require('../util/useragent');

/** @enum {string} */
var SP_EVENTS = {
    LOGIN_COMPLETE: 'auth_login_complete',
    LOGOUT_COMPLETE: 'auth_logout_complete',
    ENGAGE_AUTH_CLOSE: 'engage_auth_close'
};

/**
 * @param {string} articleId
 * @param {string} siteId
 * @param {Object=} opt_config Configuration options
 * @param {string=} opt_serverUrl
 * @constructor
 */
function LfspDelegate(articleId, siteId, opt_config) {
    this.articleId = base64.btoa(articleId);
    this.siteId = siteId;
    this.serverUrl = opt_serverUrl;

	var config = opt_config || {};

	var spObject = this.spObject = window.fyre.sp;
	this.engageApp = new spObject.app.Engage(config.engageOpts || {});
	this.profileApp = new spObject.app.Profile(config.profileOpts || {});

    spObject.on(SP_EVENTS.LOGIN_COMPLETE, function(data) {
        user.login(data['token']);
        user.remoteLogin({
            articleId: this.articleId,
            siteId: this.siteId,
            serverUrl: this.serverUrl
        });
    }, this);
    spObject.on(SP_EVENTS.LOGOUT_COMPLETE, function() {
        user.logout();
    }, this);
}

/**
 *
 */
LfspDelegate.prototype.login = function() {
    function success(data) {
        user.login(data['token']);
        this.spObject.off(SP_EVENTS.LOGIN_COMPLETE, success);
        this.spObject.off(SP_EVENTS.ENGAGE_AUTH_CLOSE, failure);
    }
    function failure() {
        this.spObject.off(SP_EVENTS.ENGAGE_AUTH_CLOSE, failure);
        this.spObject.off(SP_EVENTS.LOGIN_COMPLETE, success);
    }
    this.engageApp.signIn();
    this.spObject.on(SP_EVENTS.LOGIN_COMPLETE, success, this);
    this.spObject.on(SP_EVENTS.ENGAGE_AUTH_CLOSE, failure, this);
};

/**
 * @param {function()} callback
 */
LfspDelegate.prototype.logout = function(callback) {
	this.engageApp.signOut();
};

/**
 * It really seems like the lfsp profiles app should take care of most of this
 * stuff.
 * @param {Object} author
 */
LfspDelegate.prototype.viewProfile = function(author) {
    var id, profileUrl;
    
    if (author.isCuratedAuthor) {
	    profileUrl = author.profileUrl;
	    if (!profileUrl) {
	        return;
	    }
	    if (useragent.isMobile) {
	        location.href = profileUrl;
	        return;
	    }
	    window.open(author.profileUrl,'authWindow',
            'location=true;menubar=false;resizable=false;scrollbars=false');
        return;
    }
    if (author.id !== user.id) {
        id = author.id.split('@')[0];
    }
    this.profileApp.viewProfile(id);

};

/**
 * Launch edit profile from lfsp.
 */
LfspDelegate.prototype.editProfile = function() {
	this.profileApp.editProfile();
};

LfspDelegate.prototype.restoreSession = function() {};

/**
 * Clean up any handlers, etc.
 */
LfspDelegate.prototype.destroy = function() {
    this.spObject.off(null, null, this);
    this.articleId =
        this.siteId =
        this.serverUrl =
        this.profileApp =
        this.engageApp = null;
};

module.exports = LfspDelegate;
