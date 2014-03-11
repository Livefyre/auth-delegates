var LivefyreUser = require('auth-delegates/user');
var RemoteDelegate = require('auth-delegates/delegates/remote');
var storage = require('auth-delegates/util/storage');
var user = require('auth-delegates/user');
var sinon = require('sinon');

describe('remote delegate', function() {
    describe('maintains the required interface', function() {
        it('has viewProfile and editProfile handlers', function() {
            chai.assert.isFunction(RemoteDelegate.prototype.viewProfile);
            chai.assert.isFunction(RemoteDelegate.prototype.editProfile);
        });

        it('has login, restoreSession, and logout handlers', function() {
            chai.assert.isFunction(RemoteDelegate.prototype.login);
            chai.assert.isFunction(RemoteDelegate.prototype.logout);
            chai.assert.isFunction(RemoteDelegate.prototype.restoreSession);
        });

        it('is constructable and destroyable', function() {
            var delegate = new RemoteDelegate('abc', 'def');
            chai.assert.isFunction(RemoteDelegate.prototype.destroy);
            delegate.destroy();
        });
    });

    it('has getUser and user', function() {
      chai.assert.isFunction(RemoteDelegate.prototype.getUser);
      chai.assert.equal(RemoteDelegate.prototype.user, LivefyreUser);

      var delegate = new RemoteDelegate('abc', 'def');
      chai.assert.equal(delegate.getUser(), LivefyreUser);
      delegate.destroy();
    });    

    describe('viewProfile', function() {
        it('triggers a window.open by default to the profile url', function(done) {
            var profileUrl = 'abc';
            var stub = sinon.stub(window, 'open', function(url) {
                chai.expect(url).to.equal(profileUrl);
                delegate.destroy();
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
            delegate.destroy();
        });
    });

    describe('restoreSession', function () {
        it('logins in remote, then uses local storage', function (done) {
            var delegate = new RemoteDelegate('122', '456', 'http://localhost:8090');
            var remoteSpy = sinon.spy(user, 'remoteLogin');
            var token = 'eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9.eyJkb21haW4iOiAibGl2ZWZ5cmUuY29tIiwgImV4cGlyZXMiOiAxMzg5NTc0NzIzLjgyODUzOSwgInVzZXJfaWQiOiAiX3U2OTYifQ.wUFdqAPwCOzeuYcHVGdbVdAvdSto6Td65mfDlvDw-iY';

            function handleLogin(){
                chai.assert(remoteSpy.called);
                user.removeListener('login', handleLogin);
                // now loggin in again should yield no remote login call.
                user.login(token);
                console.log('handleLog');
                // Storage is slow to set, so wait for it.
                chai.assert(!remoteSpy.calledTwice);
                user.logout();
                delegate.destroy();
                done();
            }


            user.on('login', handleLogin);
            user.login(token);
        });
    });
});
