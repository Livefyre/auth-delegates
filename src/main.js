module.exports = {
  user: require('auth-delegates/user'),
  authDelegates: {
    Backplane: require('auth-delegates/delegates/backplane'),
    Lfsp: require('auth-delegates/delegates/lfsp'),
    Livefyre: require('auth-delegates/delegates/livefyre'),
    Remote: require('auth-delegates/delegates/remote')
  }
};
