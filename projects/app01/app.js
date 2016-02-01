var http = require('http');
var express = require('express');
var path = require('path');


var app = express();

app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));

app.locals.capitalize = function(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

var server = http.createServer(app);

server.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
