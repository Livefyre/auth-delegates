require.config({
  baseUrl: '/',
  paths: {
    base64: 'lib/base64/base64',
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
