var fs = require('fs');
var path = require('path');

module.exports = {
  list: function() {
    return fs.readdirSync(path.join('projects'));
  },
  create: function(project) {
    fs.mkdir(path.join('projects/' + project.name), function() {

    });
  },
  delete: function(projectName) {
    fs.rmdirSync(path.join('projects/' + projectName));
  }
}
