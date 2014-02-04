var LfspDelegate = require('auth-delegates/delegates/lfsp');

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

describe('lfsp delegate', function() {
	describe('maintains expected interface', function() {
		it('has viewProfile and editProfile handlers', function() {
			chai.assert.isFunction(LfspDelegate.prototype.viewProfile);
			chai.assert.isFunction(LfspDelegate.prototype.editProfile);
		});

		it('has login, loadSession, and logout handlers', function() {
			chai.assert.isFunction(LfspDelegate.prototype.login);
			chai.assert.isFunction(LfspDelegate.prototype.loadSession);
			chai.assert.isFunction(LfspDelegate.prototype.logout);
		});

		it('is constructable and destroyable', function() {
			var delegate = new LfspDelegate('abc', 'def');
			chai.assert.isFunction(LfspDelegate.prototype.destroy);
			delegate.destroy();
		});
	});
});