var BaseDelegate = require('auth-delegates/delegates/base');
var LivefyreUser = require('auth-delegates/user');
var inherits = require('inherits');

describe('base delegate', function() {
  it('maintains the correct interface', function() {
    chai.assert.isFunction(BaseDelegate.prototype.viewProfile);
    chai.assert.isFunction(BaseDelegate.prototype.editProfile);
    chai.assert.isFunction(BaseDelegate.prototype.login);
    chai.assert.isFunction(BaseDelegate.prototype.logout);
    chai.assert.isFunction(BaseDelegate.prototype.restoreSession);
  });

  it('has a get user function and user is overridable on the prototype', function() {
    chai.assert.isFunction(BaseDelegate.prototype.getUser);
    chai.assert.equal(BaseDelegate.prototype.user, LivefyreUser);

    var delegate = new BaseDelegate();
    chai.assert.equal(delegate.getUser(), LivefyreUser);

    var user = {'some': 'user'};
    var CustomDelegate = function() {
      this.user = user;
    };
    inherits(CustomDelegate, BaseDelegate);

    var customDelegate = new CustomDelegate();
    chai.assert.equal(customDelegate.getUser(), user);
  });
});
