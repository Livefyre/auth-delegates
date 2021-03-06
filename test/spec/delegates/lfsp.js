var LfspDelegate = require('auth-delegates/delegates/lfsp');
var LivefyreUser = require('auth-delegates/user');

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

		it('has login, restoreSession, and logout handlers', function() {
			chai.assert.isFunction(LfspDelegate.prototype.login);
			chai.assert.isFunction(LfspDelegate.prototype.logout);
			chai.assert.isFunction(LfspDelegate.prototype.restoreSession);
		});

		it('has getUser and user', function() {
			chai.assert.isFunction(LfspDelegate.prototype.getUser);
			chai.assert.isFunction(LfspDelegate.prototype.setUser);
			chai.assert.equal(LfspDelegate.prototype._user, LivefyreUser);

			var delegate = new LfspDelegate('abc', 'def');
			chai.assert.equal(delegate.getUser(), LivefyreUser);
			delegate.destroy();
		});

		it('is constructable and destroyable', function() {
			var delegate = new LfspDelegate('abc', 'def');
			chai.assert.isFunction(LfspDelegate.prototype.destroy);
			delegate.destroy();
		});
	});
});
