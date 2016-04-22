var fs = require('fs');
var path = require('path');
var formats = [{
  "format": "javascript",
  "ext": "js"
}, {
  "format": "html",
  "ext": "html"
}, {
  "format": "css",
  "ext": "css"
}, {
  "format": "json",
  "ext": "json"
}, {
  "format": "markdown",
  "ext": "md"
}, {
  "format": "ruby",
  "ext": "rb"
}, {
  "format": "sass",
  "ext": ["scss", "sass"]
}, {
  "format": "html_ruby",
  "ext": "erb"
}, {
  "format": "rhtml",
  "ext": "rhtml"
}, {
  "format": "xml",
  "ext": "xml"
}, {
  "format": "gitignore",
  "ext": "gitignore"
}, {
  "format": "jade",
  "ext": "jade"
}, {
  "format": "php",
  "ext": "php"
}, {
  "format": "sql",
  "ext": "sql"
}, {
  "format": "powershell",
  "ext": "ps1"
}, {
  "format": "batchfile",
  "ext": "bat"
}, {
  "format": "coffee",
  "ext": "coffee"
}, {
  "format": "csharp",
  "ext": "cs"
}, {
  "format": "python",
  "ext": "py"
}, {
  "format": "pgsql",
  "ext": "pgsql"
}, {
  "format": "lua",
  "ext": "lua"
}, {
  "format": "jsx",
  "ext": "jsx"
}, {
  "format": "ini",
  "ext": "ini"
}, {
  "format": "dockerfile",
  "ext": "DockerFile"
}, {
  "format": "sh",
  "ext": "sh"
}];

module.exports = function(filePath) {
  var fileName = path.basename(filePath);
  var extension = path.extname(fileName).slice(1);
  var ext = '';
  var extensionName = '';

  ext = extension || fileName.slice(1);

  formats.forEach(function(format) {
    if(format.ext instanceof Array) {
      format.ext.forEach(function(x) {
        if(x == ext) extensionName = format.format;
      });
    } else {
      if(format.ext == ext) extensionName = format.format;
    }
  });
  return extensionName || 'plain_text';
}
