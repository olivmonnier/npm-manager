var fs = require('fs');
var path = require('path');

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

module.exports = {
  list: function() {
    return fs.readdirSync(path.join('projects'));
  },
  create: function(project) {
    if (!project.name) return;

    fs.mkdirSync(path.join('projects/' + project.name));
    fs.writeFileSync(path.join('projects/' + project.name +'/package.json'), JSON.stringify(packageContent(project), null, 2), 'utf8');
    return;
  },
  delete: function(projectName) {
    fs.rmdirSync(path.join('projects/' + projectName));
  }
}
