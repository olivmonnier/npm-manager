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

function streamEventsProcess(project, processChild, io) {
  var roomIndex = _.findIndex(ROOMS, function(rooms) { return rooms.name == project; });

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
    io.to(project).emit('log', data);
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
    var roomIndex = _.findIndex(ROOMS, function(rooms) { return rooms.name == project; });
    var logRun = 'Command running';

    ROOMS[roomIndex].logs.push(logRun);
    ROOMS[roomIndex].processes.push({name: scriptName, pid: child.pid});
    io.to(project).emit('log', logRun);

    streamEventsProcess(project, child, io);
  },
  kill: function(pid, signal, callback) {
    var isWin = /^win/.test(process.platform);
    if(!isWin) {
      killProcess(pid, signal, callback);
    } else {
      cp.exec('taskkill /PID ' + pid + ' /T /F');
    }
  }
}
