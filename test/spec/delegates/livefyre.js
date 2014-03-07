var LivefyreDelegate = require('auth-delegates/delegates/livefyre');
var user = require('auth-delegates/user');
var sampleProfile = {"collection_id": "0h hai", "profile":{"profileUrl":"admin.fy.re/profile/696/","settingsUrl":"admin.fy.re/profile/edit/info","displayName":"systemowner","avatar":"http://gravatar.com/avatar/f79fae57457a4204aeb07e92f81019bd/?s=50&d=http://d25bq1kaa0xeba.cloudfront.net/a/anon/50.jpg","id":"_u696@livefyre.com"},"auth_token":{"value":"eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9.eyJkb21haW4iOiAibGl2ZWZ5cmUuY29tIiwgImV4cGlyZXMiOiAxMzg5NTc0NzIzLjgyODUzOSwgInVzZXJfaWQiOiAiX3U2OTYifQ.wUFdqAPwCOzeuYcHVGdbVdAvdSto6Td65mfDlvDw-iY","ttl":2592000}, "token":{"value":"eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9.eyJkb21haW4iOiAibGl2ZWZ5cmUuY29tIiwgImV4cGlyZXMiOiAxMzg5NTc0NzIzLjgyODUzOSwgInVzZXJfaWQiOiAiX3U2OTYifQ.wUFdqAPwCOzeuYcHVGdbVdAvdSto6Td65mfDlvDw-iY","ttl":2592000},"version":"__VERSION__","isModAnywhere":true,"permissions":{"moderator_key":"8d565e9925fbd3aaf2e3dc989f4c58ab485574e8","authors":[{"id":"_u696@livefyre.com","key":"cbeee2ca676b7e9641f2c177d880e3ca3ecc295a"}]}};
var sampleStorage = JSON.parse(JSON.stringify(sampleProfile));

describe('livefyre.com delegate', function() {
  describe('maintains the required interface', function() {
    it('has viewProfile and editProfile handlers', function() {
      chai.assert.isFunction(LivefyreDelegate.prototype.viewProfile);
      chai.assert.isFunction(LivefyreDelegate.prototype.editProfile);
    });

    it('has login, restoreSession, and logout handlers', function() {
      chai.assert.isFunction(LivefyreDelegate.prototype.login);
      chai.assert.isFunction(LivefyreDelegate.prototype.logout);
      chai.assert.isFunction(LivefyreDelegate.prototype.restoreSession);
    });

    it('is constructable and destroyable', function() {
      var delegate = new LivefyreDelegate('abc', 'def');
      chai.assert.isFunction(LivefyreDelegate.prototype.destroy);
      delegate.destroy();
    });

    it('restores session', function(done) {
      var delegate = new LivefyreDelegate('122', '456', 'http://localhost:8090');
      function handleLogin() {
        user.removeListener('login', handleLogin);
        chai.assert(user.isAuthenticated());
        // Clear data to defaults, and restore from storage.
        user.set({
          'modMap': {},
          'keys': [],
        });
        user.unset('id');
        user.unset('token');
        user.unset('displayName');
        delegate.restoreSession();
        chai.assert(!user.isAuthenticated());
        delegate.destroy();
        done();
      }

      user.on('login', handleLogin);

      user.loadSession(sampleProfile, '122');
    });
  });
});
