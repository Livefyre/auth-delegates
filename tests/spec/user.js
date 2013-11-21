var User = require('auth-delegates/user');

describe('auth-delegates/user', function() {
    describe('is global but kind and a singleton', function() {
        it('has a fancy namespace', function() {
            chai.assert(typeof(livefyre) == 'object');
            chai.assert(typeof(livefyre.user) == 'object');
        });

        it('is a singleton', function() {
            chai.assert(true);
        });
    });
});