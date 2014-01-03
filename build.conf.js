({
  mainConfigFile: 'requirejs.conf.js',
  paths: {
    almond: 'lib/almond/almond'
  },
  baseUrl: '.',
  name: 'auth-delegates',
  include: [
    'almond'
  ],
  stubModules: ['text', 'hgn', 'json'],
  out: "dist/auth-delegates.min.js",
  namespace: 'Livefyre',
  pragmasOnSave: {},
  cjsTranslate: true,
  optimize: "none",
  preserveLicenseComments: false,
  uglify2: {
    compress: {
      unsafe: true
    },
    mangle: true
  },
  generateSourceMaps: true,
  onBuildRead: function(moduleName, path, contents) {
    if (moduleName == "jquery") {
      contents = "define([], function(require, exports, module) {" + contents + "});";
    }
    return contents;
  }
})
