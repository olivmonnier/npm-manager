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

function streamEventsProcess(project, scriptName, processChild, io) {
  var roomIndex = _.findIndex(ROOMS, function(rooms) { return rooms.name == project; });
  var logRun = 'Command running';
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
    ROOMS[roomIndex].logs.push(data);
    ROOMS[roomIndex].processes = _.remove(ROOMS[roomIndex].processes, function(process) {
      return process.pid != child.pid;
    });
    io.to(project).emit('killProcess', child.pid);
    io.to(project).emit('log', 'close: ' + data);
  });
}

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

    streamEventsProcess(project, scriptName, child, io);
  },
  kill: function(pid, project, io) {
    var isWin = /^win/.test(process.platform);

    if(!isWin) {
      killProcess(pid);
    } else {
      cp.exec('taskkill /PID ' + pid + ' /T /F');
    }
  }
}
