var fs = require('fs');
var path = require('path');
var execSync = require('child_process').execSync;
var rimraf = require('rimraf');
var dirTree = require('directory-tree');
var junk = require('junk');
var _ = require('lodash');
var formatFile = require('./formatFile');
var Pkg = require('./pkg.js');
var formatTreeview = require('./treeDirectory');

var packageContent = function (args) {
  return {
    "name": args.name,
    "version": args.version || "0.0.1",
    "description": args.description || "",
    "main": args.main || "index.js",
    "scripts": {},
    "author": args.author || ""
  }
}

module.exports = function(projectName, io) {
  var cmdPath = 'projects/' + projectName;

  return {
    hasPackageJson: function () {
      try {
        this.file.content('/package.json');
      } catch (e) {
        return false;
      }
      return true;
    },
    list: function() {
      var files = fs.readdirSync(path.join('projects'));
      return files.filter(junk.not);
    },
    create: function(project) {
      fs.mkdirSync(path.join(cmdPath));
      fs.writeFileSync(path.join(cmdPath +'/package.json'), JSON.stringify(packageContent(project), null, 2), 'utf8');
      ROOMS.push({ name: projectName, logs: [], processes: [] });
    },
    clone: function(gitUrl) {
      var self = this;
      fs.mkdirSync(path.join(cmdPath));
      execSync('cd ' + cmdPath + ' && git clone ' + gitUrl + ' ./');
      var config = Pkg('.tmp', io).infos();
      self.folder.rename(cmdPath, 'projects/' + config.name);
    },
    update: function(config) {
      if (config) {
        var datas = JSON.parse(config.configFile);

        fs.writeFileSync(path.join(cmdPath +'/package.json'), config.configFile, 'utf8');
        rimraf.sync(path.join(cmdPath + '/node_modules'));
        execSync('cd ' + cmdPath + ' && npm cache clean ./');
        this.folder.rename(path.join(cmdPath), path.join('projects/' + datas.name));

        ROOMS = _.remove(ROOMS, function(room) {
          return room.name != projectName;
        });
        ROOMS.push({ name: datas.name, logs: [], processes: [] });

        io.to(projectName).emit('redirect', '/projects/' + datas.name);
      }
    },
    delete: function() {
      rimraf.sync(path.join(cmdPath));
      ROOMS = _.remove(ROOMS, function(room) {
        return room.name != projectName;
      });
    },
    tree: function() {
      var dirTreeHash = dirTree.directoryTree(cmdPath);

      return [{
        text: projectName,
        href: '#/',
        icon: 'glyphicon glyphicon-folder-close',
        selectedIcon: 'glyphicon glyphicon-folder-open',
        state: {
          selected: true
        },
        nodes: formatTreeview(dirTreeHash)
      }];
    },
    cleanLogs: function () {
      var roomIndex = _.findIndex(ROOMS, function(rooms) { return rooms.name == projectName; });

      ROOMS[roomIndex].logs = [];

      io.to(projectName).emit('cleanLogs', true);
    },
    file: {
      new: function(filePath) {
        fs.writeFileSync(path.join(cmdPath + filePath), '', 'utf8');
      },
      edit: function(filePath, fileContent) {
        fs.writeFileSync(path.join(cmdPath + filePath), fileContent, 'utf8');
      },
      delete: function(filePath) {
        rimraf.sync(path.join(path.join(cmdPath + filePath)));
      },
      content: function(filePath) {
        return fs.readFileSync(path.join(cmdPath + filePath), 'utf8');
      },
      extension: function(filePath) {
        return formatFile(path.join(cmdPath + filePath));
      }
    },
    folder: {
      new: function(folderPath) {
        fs.mkdirSync(path.join(cmdPath + folderPath));
      },
      delete: function(folderPath) {
        rimraf.sync(path.join(path.join(cmdPath + folderPath)));
      },
      rename: function(oldPath, newPath) {
        fs.renameSync(path.join(oldPath), path.join(newPath));
      }
    }
  }
}
