/**
 * @fileoverview global user singleton unit tests.
 */

var user = require('auth-delegates/user'),
	sampleProfile = {"profile":{"profileUrl":"admin.fy.re/profile/696/","settingsUrl":"admin.fy.re/profile/edit/info","displayName":"systemowner","avatar":"http://gravatar.com/avatar/f79fae57457a4204aeb07e92f81019bd/?s=50&d=http://d25bq1kaa0xeba.cloudfront.net/a/anon/50.jpg","id":"_u696@livefyre.com"},"token":{"value":"eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9.eyJkb21haW4iOiAibGl2ZWZ5cmUuY29tIiwgImV4cGlyZXMiOiAxMzg5NTc0NzIzLjgyODUzOSwgInVzZXJfaWQiOiAiX3U2OTYifQ.wUFdqAPwCOzeuYcHVGdbVdAvdSto6Td65mfDlvDw-iY","ttl":2592000},"version":"__VERSION__","isModAnywhere":true,"permissions":{"moderator_key":"8d565e9925fbd3aaf2e3dc989f4c58ab485574e8","authors":[{"id":"_u696@livefyre.com","key":"cbeee2ca676b7e9641f2c177d880e3ca3ecc295a"}]}},
    storage = require('auth-delegates/util/storage');

describe('auth-delegates/user', function() {
    describe('is global', function() {
        it('has a fancy namespace', function() {
            chai.assert(typeof(livefyre) == 'object');
            chai.assert(typeof(livefyre.user) == 'object');
            chai.assert(typeof(livefyre.user.login) == 'function');
            chai.assert(typeof(livefyre.user.logout) == 'function');
            chai.assert(typeof(livefyre.user.on) == 'function');
            chai.assert(typeof(livefyre.user.removeListener) == 'function');
        });
    });

    describe('spawns correct events', function() {
    	it('fires change event', function() {
    		var changeFired = false;
    		user.on('change', function() {
    			changeFired = true;
    		});
    		user.set('token', 'abc');
    		chai.assert(changeFired);
    	});
    	it('fires login event', function() {
    		var changeFired = false;
    		user.on('login', function() {
    			changeFired = true;
    		});
    		user.login('abcdefg');
    		chai.assert(changeFired)
            user.logout();
    	});
    	it('fires logout event', function() {
    		var logout = false;
    		user.on('logout', function() {
    			logout = true;
    		});
    		user.logout();
    		chai.assert(logout);
    	});
    });

    describe('setters/getters/unsetters work', function() {
    	it('sets and gets string key', function() {
    		user.set('abc', 'def');
    		chai.assert(user.get('abc') === 'def');
    	});

    	it('sets and gets object', function() {
    		user.set({
    			'abc': 'def',
    			'ghi': 'jkl'
    		});
    		chai.assert(user.get('abc') === 'def');
    		chai.assert(user.get('ghi') === 'jkl');
    	});

    	it('unsets key', function() {
    		user.set('token', 'abc');
    		user.unset('token');
    		chai.assert(user.get('token') === undefined);
    	});
    });

    describe('Login user and logout user correctly', function() {
    	it('login parses profile data', function() {
            user.login(sampleProfile);

            chai.assert(user.get('id') === '_u696@livefyre.com');
            chai.assert(user.get('mod'));
            chai.assert(user.get('profileUrl') === 'admin.fy.re/profile/696/');
            chai.assert(user.get('settingsUrl') === 'admin.fy.re/profile/edit/info');
            chai.assert(user.get('displayName') === 'systemowner');
            chai.assert(user.get('keys').length === 2);
            chai.assert(user.get('avatar') === 'http://gravatar.com/avatar/f79fae57457a4204aeb07e92f81019bd/?s=50&d=http://d25bq1kaa0xeba.cloudfront.net/a/anon/50.jpg');
            user.logout();
    	});
    	it('logout clears profile data', function() {
    		user.set('token', 'abce');
    		chai.assert(user.get('token'));

            user.logout();
            chai.assert(user.get('token') === undefined);
    	});
    });

    describe('Storage for user login and logout works', function() {
        it('Sets and clear storage', function() {
            user.login(sampleProfile);
            var authData = storage.get('fyre-auth');
            chai.assert.deepEqual(authData, sampleProfile);
            user.logout();
            authData = storage.get('fyre-auth');
            chai.assert.isUndefined(authData);
        });
    });
});