var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var path = require('path');
var cluster = require('cluster');
var _ = require('lodash');
var sticky = require('sticky-session');

global.ROOMS = [];

if (cluster.isMaster) {
  var numWorkers = require('os').cpus().length;

  console.log('Master cluster setting up ' + numWorkers + ' workers...');

  for(var i = 0; i < numWorkers; i++) {
      cluster.fork();
  }

  cluster.on('online', function(worker) {
      console.log('Worker ' + worker.process.pid + ' is online');
  });

  cluster.on('exit', function(worker, code, signal) {
      console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
      console.log('Starting a new worker');
      cluster.fork();
  });
} else {
  var express = require('express');
  var app = express();
  var server = require('http').Server(app);
  var io = require('socket.io')(server);
  var Monitor = require('monitor');
  var processMonitor = new Monitor({
    probeClass:'Process'
  });

  // Routes
  var projects = require('./routes/projects')(io);

  app.set('port', process.env.PORT || 3000);
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(require('connect-livereload')());

  app.locals.capitalize = function(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  // Routes
  app.use('/projects', projects);

  if ('development' == app.get('env')) {
    app.use(errorHandler());
  }

  processMonitor.connect();

  if(!sticky.listen(server, 3000)) {
    server.once('listening', function() {
      console.log('server started on 3000 port');
    });
  } else {
    server.listen(app.get('port'), function() {
      console.log('Express server listening on port ' + app.get('port'));
    });
  }


  io.on('connection', function(socket) {
    socket.on('room', function(room) {
      var roomIndex = _.findIndex(ROOMS, function(rooms) { return rooms.name == room; });

      socket.join(room);
      if(roomIndex == '-1') {
        ROOMS.push({ name: room, logs: [], processes: [] });
      }
    });

    processMonitor.on('change', function() {
      socket.emit('monitor', processMonitor.toJSON());
    });

    socket.emit('init', ROOMS);
  });
}
