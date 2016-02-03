var socket = io.connect();

socket.on('connect', function(data) {
  if (ROOM !== null) {
    socket.emit('room', ROOM);
  }
});

socket.on('init', function(data) {
  var roomIndex = _.findIndex(data, function(rooms) {return rooms.name == ROOM; });

  if (data[roomIndex]) {
    data[roomIndex].logs.forEach(function(log) {
      $('#logs').append(log + '<br/>');
    });
    data[roomIndex].processes.forEach(function(process) {
      $('#processes').append(
        '<li data-process="' + process.pid + '">' +
          '<a href="/projects/' + ROOM + '/scripts?name=' + process.name + '&action=kill&pid=' + process.pid + '" class="btn btn-link btn-ajax">' +
            process.name +
            ' <i class="glyphicon glyphicon-remove"></i>' +
          '</a>' +
        '</li>'
      );
    });
  }
});

socket.on('log', function(data) {
   $('#logs').append(data + '<br/>');
});

socket.on('process', function(data) {
  $('#processes').append(
    '<li data-process="' + data.pid + '">' +
      '<a href="/projects/' + ROOM + '/scripts?name=' + data.name + '&action=kill&pid=' + data.pid + '" class="btn btn-link btn-ajax">' +
        data.name +
        ' <i class="glyphicon glyphicon-remove"></i>' +
      '</a>' +
    '</li>'
  );
});

socket.on('killProcess', function(pid) {
  $('[data-process=' + pid + ']').remove();
});

socket.on('pkgAdd', function(data) {
  $('.pkg-list.' + data.env).append(
    '<li class="list-group-item" data-pkg="' + data.name + '">' +
      '<a href="https://www.npmjs.com/search?q=' + data.name + '" target="_blank">' + data.name + '</a>' +
      '<div class="pull-right">' +
        '<a class="btn btn-warning btn-ajax" href="/projects/' + ROOM + '/packages?name=' + data.name + '&env=' + data.env + '&action=delete">' +
          '<i class="glyphicon glyphicon-trash"></i>' +
        '</a>' +
      '</div>' +
    '</li>'
  );
});

socket.on('pkgDelete', function(data) {
  $('.pkg-list.' + data.env).find('[data-pkg=' + data.name + ']').remove();
});

$(document).on('click', '.btn-ajax', function(e) {
  e.preventDefault();

  $.get($(this).attr('href'));
});

$(document).on('click', '.btn-add-pkg', function() {
  var parent = $(this).parent();

  $.get('/projects/' + parent.find('[name=name]').val() + '/packages', {
    action: 'add',
    name: parent.find('[name=pkgName]').val(),
    env: parent.find('[name=env]').val()
  });
});
