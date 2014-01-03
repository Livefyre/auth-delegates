require.config({
  baseUrl: '/',
  paths: {
    'event-emitter': 'lib/event-emitter/src/event-emitter',
    inherits: 'lib/inherits/inherits',
    Squire: 'lib/squire/src/Squire'
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