var LfepDelegate = require('auth-delegates/delegates/lfep');

window.fyre = {
	sp: {
		app: {
			Engage: function() {},
			Profile: function() {}
		},
		on: function() {},
		off: function() {}
	}
};

describe('lfep delegate', function() {
	describe('maintains expected interface', function() {
		it('has viewProfile and editProfile handlers', function() {
			chai.assert.isFunction(LfepDelegate.prototype.viewProfile);
			chai.assert.isFunction(LfepDelegate.prototype.editProfile);
		});

		it('has login, loadSession, and logout handlers', function() {
			chai.assert.isFunction(LfepDelegate.prototype.login);
			chai.assert.isFunction(LfepDelegate.prototype.logout);
			chai.assert.isFunction(LfepDelegate.prototype.restoreSession);
		});

		it('is constructable and destroyable', function() {
			var delegate = new LfepDelegate('abc', 'def');
			chai.assert.isFunction(LfepDelegate.prototype.destroy);
			delegate.destroy();
		});
	});
});
