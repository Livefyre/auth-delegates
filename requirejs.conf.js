require.config({
  baseUrl: '/',
  paths: {
    'event-emitter': 'lib/event-emitter/src/event-emitter',
    inherits: 'lib/inherits/inherits'
  },
  packages: [{
    name: 'auth-delegates',
    location: 'src'
  },
  {
    name: 'auth-delegates-tests',
    location: 'tests'
  }]
});