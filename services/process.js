var psTree = require('ps-tree');
var _ = require('lodash');

module.exports = function (project, io) {
  var roomIndex = _.findIndex(ROOMS, function(rooms) { return rooms.name == project; });

  return {
    kill: function (pid, signal, callback) {
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
    },
    killAll: function () {
      var self = this;

      ROOMS[roomIndex].processes.forEach(function(process) {
        self.kill(process.pid);
      });
    },
    streamEvents: function (scriptName, processChild, logRun) {
      var logRun = logRun || '<br/>Command running';
      var child = {name: scriptName, pid: processChild.pid};

      ROOMS[roomIndex].logs.push(logRun);
      ROOMS[roomIndex].processes.push(child);
      io.to(project).emit('log', logRun);
      io.to(project).emit('process', child);

      processChild.stdout.setEncoding('utf8').on('data', function(data) {
        ROOMS[roomIndex].logs.push(data);
        io.to(project).emit('log', data);
      });
      processChild.stderr.setEncoding('utf8').on('data', function(data) {
        ROOMS[roomIndex].logs.push(data);
        io.to(project).emit('log', data);
      });
      processChild.on('error', function(data) {
        ROOMS[roomIndex].logs.push(data);
        io.to(project).emit('log', data);
      });
      processChild.on('close', function(data) {
        var log = 'Process finished <br/>';
        ROOMS[roomIndex].logs.push(log);
        ROOMS[roomIndex].processes = _.remove(ROOMS[roomIndex].processes, function(process) {
          return process.pid != child.pid;
        });
        io.emit('killProcess', child.pid);
        io.to(project).emit('log', log);
      });
    }
  }
}
