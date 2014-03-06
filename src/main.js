module.exports = {
  user: require('auth-delegates/user'),
  authDelegates: {
    Backplane: require('auth-delegates/delegates/backplane'),
    Lfep: require('auth-delegates/delegates/lfep'),
    Livefyre: require('auth-delegates/delegates/livefyre'),
    Remote: require('auth-delegates/delegates/remote')
  }
};
