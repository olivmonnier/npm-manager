var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');
var dirTree = require('directory-tree');

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
      return fs.readdirSync(path.join('projects'));
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

        io.to(projectName).emit('scripts', Object.keys(datas.scripts));
      }
    },
    delete: function() {
      rimraf.sync(path.join(cmdPath));
    },
    tree: function() {
      var dirTreeHash = dirTree.directoryTree(cmdPath);

      return formatTreeview(dirTreeHash);
    },
    fileContent: function(filePath) {
      return fs.readFileSync(path.join(cmdPath + filePath), 'utf8');
    }
  }
}
