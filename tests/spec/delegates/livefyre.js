var LivefyreDelegate = require('auth-delegates/delegates/livefyre');

describe('livefyre.com delegate', function() {
	describe('maintains the required interface', function() {
		it('has viewProfile and editProfile handlers', function() {
			chai.assert.isFunction(LivefyreDelegate.prototype.viewProfile);
			chai.assert.isFunction(LivefyreDelegate.prototype.editProfile);
		});

		it('has login and logout handlers', function() {
			chai.assert.isFunction(LivefyreDelegate.prototype.login);
			chai.assert.isFunction(LivefyreDelegate.prototype.logout);
		});

		it('has setCollection and loadSession handlers', function() {
			chai.assert.isFunction(LivefyreDelegate.prototype.setCollection);
			chai.assert.isFunction(LivefyreDelegate.prototype.loadSession);
		});

		it('is constructable and destroyable', function() {
			var delegate = new LivefyreDelegate();
			chai.assert.isFunction(LivefyreDelegate.prototype.destroy);
			delegate.destroy();
		});
	});
});