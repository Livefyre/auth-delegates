var BackplaneDelegate = require('auth-delegates/delegates/backplane');
var LivefyreUser = require('auth-delegates/user');

describe('backplane delegate', function() {
	before(function() {
		window.Backplane = function() {};
		window.Backplane.version = "2.0.6";
	});

	describe('maintains the required interface', function() {
		it('has viewProfile and editProfile handlers', function() {
			chai.assert.isFunction(BackplaneDelegate.prototype.viewProfile);
			chai.assert.isFunction(BackplaneDelegate.prototype.editProfile);
		});

		it('has login, restoreSession, and logout handlers', function() {
			chai.assert.isFunction(BackplaneDelegate.prototype.login);
			chai.assert.isFunction(BackplaneDelegate.prototype.logout);
			chai.assert.isFunction(BackplaneDelegate.prototype.restoreSession);
		});

		it('has getUser and user', function() {
			chai.assert.isFunction(BackplaneDelegate.prototype.getUser);
			chai.assert.isFunction(BackplaneDelegate.prototype.setUser);
			chai.assert.equal(BackplaneDelegate.prototype._user, LivefyreUser);

			var delegate = new BackplaneDelegate('abc', 'def');
			chai.assert.equal(delegate.getUser(), LivefyreUser);
			delegate.destroy();
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
