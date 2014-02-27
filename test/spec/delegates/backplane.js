var BackplaneDelegate = require('auth-delegates/delegates/backplane');

describe('livefyre.com delegate', function() {
	before(function() {
		window.Backplane = function() {};
		window.Backplane.version = "2.0.6";
	});

	describe('maintains the required interface', function() {
		it('has viewProfile and editProfile handlers', function() {
			chai.assert.isFunction(BackplaneDelegate.prototype.viewProfile);
			chai.assert.isFunction(BackplaneDelegate.prototype.editProfile);
		});

		it('has login, loadSession, and logout handlers', function() {
			chai.assert.isFunction(BackplaneDelegate.prototype.login);
			chai.assert.isFunction(BackplaneDelegate.prototype.logout);
		});

		it('is constructable and destroyable', function() {
			var delegate = new BackplaneDelegate('abc', 'def');
			chai.assert.isFunction(BackplaneDelegate.prototype.destroy);
			delegate.destroy();
		});
	});

	after(function() {
		delete window.Backplane;
	});
});
