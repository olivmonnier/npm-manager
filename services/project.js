var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');

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
    delete: function(projectName) {
      rimraf.sync(path.join(cmdPath));
    }
  }
}
