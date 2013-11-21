# Javascript Authentication Delegates

## Install
```npm install```

## Test
To run in phantomjs: ```npm test```
To run in the browser, ```npm start``` and navigate to http://localhost:{port}/tests/runner.html

## Samples
```npm start```

Navigate to http://localhost:{port}/samples

## Interface

All auth delegate objects need to provide the following functions:
  - login
  - logout
  - viewProfile
  - editProfile
  - loadSession (optional)
