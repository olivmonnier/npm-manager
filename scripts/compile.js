var concat = require('concat');

concat([
  './node_modules/jquery/dist/jquery.js',
  './node_modules/bootstrap-sass/assets/javascripts/bootstrap.js'
], './public/vendor.js', function(error) {
  if (error) return console.log(error);
});
