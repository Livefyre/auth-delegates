var RemoteDelegate = require('auth-delegates/delegates/remote');
var sinon = require('sinon');

describe('remote delegate', function() {
	describe('maintains the required interface', function() {
		it('has viewProfile and editProfile handlers', function() {
			chai.assert.isFunction(RemoteDelegate.prototype.viewProfile);
			chai.assert.isFunction(RemoteDelegate.prototype.editProfile);
		});

		it('has login, loadSession, and logout handlers', function() {
			chai.assert.isFunction(RemoteDelegate.prototype.login);
			chai.assert.isFunction(RemoteDelegate.prototype.logout);
		});

		it('is constructable and destroyable', function() {
			var delegate = new RemoteDelegate('abc', 'def');
			chai.assert.isFunction(RemoteDelegate.prototype.destroy);
			delegate.destroy();
		});
	});

    describe('viewProfile', function() {
        it('triggers a window.open by default to the profile url', function(done) {
            var profileUrl = 'abc';
            var stub = sinon.stub(window, 'open', function(url) {
                chai.expect(url).to.equal(profileUrl);
                done();
            });
            var delegate = new RemoteDelegate('abc', 'def');
            delegate.viewProfile({profileUrl: profileUrl});
            chai.assert(stub.calledOnce);
            stub.restore();
        });

        it('can be overridden to do custom functionality', function() {
            var spy = sinon.spy(window, 'open');
            var delegate = new RemoteDelegate('abc', 'def');
            var viewStub = sinon.stub(delegate, 'viewProfile', function() {});
            delegate.viewProfile();
            chai.assert(!spy.called);
            chai.assert(viewStub.calledOnce);
            viewStub.restore();
        });
    });
});
