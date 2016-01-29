var exec = require('child_process').execSync;
var fs = require('fs');
var log = require('./log');

module.exports = {
  add: function(pkgName, path, dev) {
    var saveEnv = (dev) ? '-D' : '-S';
    var cmdPath = path || './';
    return exec('cd ' + cmdPath + ' && npm install ' + saveEnv + ' ' + pkgName);
  },
  infos: function(path) {
    var cmdPath = path || './';
    return JSON.parse(fs.readFileSync(cmdPath + '/package.json', 'utf8'));
  },
  install: function(path) {
    var cmdPath = path || './';
    return exec('cd ' + cmdPath + ' && npm install');
  },
  uninstall: function(pkgName, path, dev) {
    var saveEnv = (dev) ? '-D' : '-S';
    var cmdPath = path || './';
    return exec('cd ' + cmdPath + ' && npm uninstall ' + saveEnv + ' ' + pkgName);
  },
  exec: function(scriptName, path) {
    var cmdPath = path || './';
    return exec('cd ' + cmdPath + ' && npm run ' + scriptName);
  }
}
