var RemoteDelegate = require('auth-delegates/delegates/remote');

describe('remote delegate', function() {
	describe('maintains the required interface', function() {
		it('has viewProfile and editProfile handlers', function() {
			chai.assert.isFunction(RemoteDelegate.prototype.viewProfile);
			chai.assert.isFunction(RemoteDelegate.prototype.editProfile);
		});

		it('has login, loadSession, and logout handlers', function() {
			chai.assert.isFunction(RemoteDelegate.prototype.login);
			chai.assert.isFunction(RemoteDelegate.prototype.loadSession);
			chai.assert.isFunction(RemoteDelegate.prototype.logout);
		});

		it('is constructable and destroyable', function() {
			var delegate = new RemoteDelegate('abc', 'def');
			chai.assert.isFunction(RemoteDelegate.prototype.destroy);
			delegate.destroy();
		});
	});
});
