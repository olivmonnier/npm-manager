var exec = require('child_process').execSync;
var log = require('./log');

module.exports = {
  add: function(pkgName, path, dev) {
    var saveEnv = (dev) ? '-D' : '-S';
    var cmdPath = path || './';
    return exec('cd ' + cmdPath + ' && npm install ' + saveEnv + ' ' + pkgName, log);
  },
  infos: function(path) {
    var cmdPath = path || './';
    return require(cmdPath + '/package.json');
  },
  install: function(path) {
    var cmdPath = path || './';
    return exec('cd ' + cmdPath + ' && npm install', log);
  },
  uninstall: function(pkgName, path, dev) {
    var saveEnv = (dev) ? '-D' : '-S';
    var cmdPath = path || './';
    return exec('cd ' + cmdPath + ' && npm uninstall ' + saveEnv + ' ' + pkgName, log);
  }
}
