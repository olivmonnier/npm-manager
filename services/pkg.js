var exec = require('child_process').exec;
var execSync = require('child_process').execSync;
var fs = require('fs');
var log = require('./log');

module.exports = {
  add: function(pkgName, path, dev) {
    var saveEnv = (dev) ? '-D' : '-S';
    var cmdPath = path || './';
    return execSync('cd ' + cmdPath + ' && npm install ' + saveEnv + ' ' + pkgName);
  },
  infos: function(path) {
    var cmdPath = path || './';
    return JSON.parse(fs.readFileSync(cmdPath + '/package.json', 'utf8'));
  },
  install: function(path) {
    var cmdPath = path || './';
    return execSync('cd ' + cmdPath + ' && npm install');
  },
  uninstall: function(pkgName, path, dev) {
    var saveEnv = (dev) ? '-D' : '-S';
    var cmdPath = path || './';
    return execSync('cd ' + cmdPath + ' && npm uninstall ' + saveEnv + ' ' + pkgName);
  },
  exec: function(scriptName, project, io) {
    var cmdPath = 'projects/' + project;
    var child = exec('cd ' + cmdPath + ' && npm run ' + scriptName);
    
    io.to(project).emit('log', 'Command running');
    child.stdout.on('data', function(data) {
      io.to(project).emit('log', data);
    });
    child.stderr.on('data', function(data) {
      io.to(project).emit('log', data);
    });
    child.on('close', function(code) {
      io.to(project).emit('log', data);
    });
  }
}
