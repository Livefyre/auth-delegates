require.config({
  baseUrl: '/',
  paths: {
    'event-emitter': 'lib/event-emitter/src/event-emitter',
    inherits: 'lib/inherits/inherits',
    md5: 'lib/js-md5/js/md5',
  },
  packages: [{
    name: 'auth-delegates',
    location: 'src'
  },
  {
    name: 'auth-delegates-tests',
    location: 'test'
  }]
});