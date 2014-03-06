var LivefyreUser = require('auth-delegates/user');
require('auth-delegates/delegates/backplane');
require('auth-delegates/delegates/lfsp');
require('auth-delegates/delegates/livefyre');
require('auth-delegates/delegates/remote');

// Make sure singleton user is created
window.Livefyre = window.Livefyre || {};
window.Livefyre.user = window.Livefyre.user || new LivefyreUser();
