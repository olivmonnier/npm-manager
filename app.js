var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var path = require('path');

//Services
var Pkg = require('./services/pkg');
var Project = require('./services/project');

var app = express();

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.route('/')
    .get(function(req, res) {
      return res.render('index', {
        title: 'home',
        projects: Project.list()
      });
    });
app.route('/:name')
  .get(function(req, res) {
    return res.render('infos', {
      title: 'Project ' + req.params.name,
      infos: Pkg.infos(path.join(__dirname, 'projects/' + req.params.name))
    });
  })
  .post(function(req, res) {
    Project.create(req.body);
    return res.redirect('/');
  });

if ('development' == app.get('env')) {
  app.use(errorHandler());
}

var server = http.createServer(app);
server.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
