var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');
var dirTree = require('directory-tree');
var junk = require('junk');
var _ = require('lodash');
var formatFile = require('./formatFile');

function packageContent(args) {
  return {
    "name": args.name,
    "version": args.version || "0.0.1",
    "description": args.description || "",
    "main": "index.js",
    "scripts": {},
    "author": args.author || ""
  }
}

var formatTreeview = function(data) {
  var tree = [];

  loopChildren(data.children, tree);
  return tree;
}
function loopChildren(children, parent) {
  children.forEach(function(child) {
    parent.push(insertChild(child));
  });
}
function insertChild(child) {
  var newChild = {
    text: child.name,
    href: '#/' + child.path,
    icon: (child.type == 'directory') ? 'glyphicon glyphicon-folder-close' : 'glyphicon glyphicon-file',
    selectedIcon: (child.type == 'directory') ? 'glyphicon glyphicon-folder-open' : 'glyphicon glyphicon-open-file'
  }
  if (child.children) {
    newChild['nodes'] = [];
    loopChildren(child.children, newChild.nodes);
  }
  return newChild;
}

module.exports = function(projectName, io) {
  var cmdPath = 'projects/' + projectName;

  return {
    list: function() {
      var files = fs.readdirSync(path.join('projects'));
      return files.filter(junk.not);
    },
    create: function(project) {
      fs.mkdirSync(path.join(cmdPath));
      fs.writeFileSync(path.join(cmdPath +'/package.json'), JSON.stringify(packageContent(project), null, 2), 'utf8');
    },
    update: function(config) {
      if (config) {
        var datas = JSON.parse(config.configFile);

        fs.writeFileSync(path.join(cmdPath +'/package.json'), config.configFile, 'utf8');
        rimraf.sync(path.join(cmdPath + '/node_modules'));
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
        fs.renameSync(oldPath, newPath);
      }
    }
  }
}
