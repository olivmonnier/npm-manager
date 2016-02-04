var exec = require('child_process').exec;
var execSync = require('child_process').execSync;
var fs = require('fs');
var psTree = require('ps-tree');
var _ = require('lodash');
var cp = require('child_process');

function killProcess(pid, signal, callback) {
  signal = signal || 'SIGKILL';
  callback = callback || function () {};
  var killTree = true;
  if(killTree) {
    psTree(pid, function (err, children) {
      [pid].concat(
        children.map(function (p) {
          return p.PID;
        })
      ).forEach(function (tpid) {
        try { process.kill(tpid, signal) }
        catch (ex) { }
      });
      callback();
    });
  } else {
    try { process.kill(pid, signal) }
    catch (ex) { }
    callback();
  }
};

module.exports = function(project, io) {
  var cmdPath = 'projects/' + project;
  var streamEventsProcess = function (scriptName, processChild, logRun) {
    var roomIndex = _.findIndex(ROOMS, function(rooms) { return rooms.name == project; });
    var logRun = logRun || 'Command running';
    var child = {name: scriptName, pid: processChild.pid};

    ROOMS[roomIndex].logs.push(logRun);
    ROOMS[roomIndex].processes.push(child);
    io.to(project).emit('log', logRun);
    io.to(project).emit('process', child);

    processChild.stdout.on('data', function(data) {
      ROOMS[roomIndex].logs.push(data);
      io.to(project).emit('log', data);
    });
    processChild.stderr.on('data', function(data) {
      ROOMS[roomIndex].logs.push(data);
      io.to(project).emit('log', data);
    });
    processChild.on('error', function(data) {
      ROOMS[roomIndex].logs.push(data);
      io.to(project).emit('log', data);
    });
    processChild.on('close', function(data) {
      var log = 'Process finished';
      ROOMS[roomIndex].logs.push(log);
      ROOMS[roomIndex].processes = _.remove(ROOMS[roomIndex].processes, function(process) {
        return process.pid != child.pid;
      });
      io.to(project).emit('killProcess', child.pid);
      io.to(project).emit('log', log);
    });
  }

  return {
    add: function(pkgName, env) {
      var saveEnv = (env == 'dev') ? '-D' : '-S';
      var child = exec('cd ' + cmdPath + ' && npm install ' + saveEnv + ' ' + pkgName);

      streamEventsProcess('pkgAdd', child, 'Install ' + pkgName + ' package');
      io.to(project).emit('pkgAdd', {name: pkgName, env: env});
    },
    infos: function() {
      return JSON.parse(fs.readFileSync(cmdPath + '/package.json', 'utf8'));
    },
    install: function() {
      var child = exec('cd ' + cmdPath + ' && npm install');

      streamEventsProcess('npmInstall', child, 'Install packages');
    },
    packages: function() {
      var pkgs = this.infos();
      var hashPkgs = {
        dev: [],
        prod: []
      }

      for(var k in pkgs.devDependencies) {
        hashPkgs.dev.push({
          name: k,
          version: pkgs.devDependencies[k],
          env: 'dev'
        });
      }

      for(var i in pkgs.dependencies) {
        hashPkgs.prod.push({
          name: k,
          version: pkgs.dependencies[k],
          env: 'prod'
        });
      }

      io.to(project).emit('packages', hashPkgs);
    },
    uninstall: function(pkgName, env) {
      var saveEnv = (env == 'dev') ? '-D' : '-S';
      var child = exec('cd ' + cmdPath + ' && npm uninstall ' + saveEnv + ' ' + pkgName);

      streamEventsProcess('pkgDelete', child, 'Uninstall ' + pkgName + ' package');
      io.to(project).emit('pkgDelete', {name: pkgName, env: env});
    },
    exec: function(scriptName) {
      var child = exec('cd ' + cmdPath + ' && npm run ' + scriptName);

      streamEventsProcess(scriptName, child);
    },
    kill: function(pid) {
      var isWin = /^win/.test(process.platform);

      if(!isWin) {
        killProcess(pid);
      } else {
        cp.exec('taskkill /PID ' + pid + ' /T /F');
      }
    }
  }
}
