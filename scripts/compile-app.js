var concat = require('concat');

concat([
  './public/src/js/file.js',
  './public/src/js/project.js',
  './public/src/js/app.js'
], './public/dist/build.js', function(error) {
  if (error) return console.log(error);
});
