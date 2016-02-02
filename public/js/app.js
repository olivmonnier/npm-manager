var socket = io.connect();

socket.on('connect', function(data) {
  if (ROOM !== null) {
    socket.emit('room', ROOM);
  }
});

socket.on('init', function(data) {
  var roomIndex = _.findIndex(data, function(rooms) {return rooms.name == ROOM; });

  if (data[roomIndex].logs && data[roomIndex].processes) {
    data[roomIndex].logs.forEach(function(log) {
      $('#logs').append(log + '<br/>');
    });
    data[roomIndex].processes.forEach(function(process) {
      $('#processes').append(
        '<li data-process="' + process.pid + '">' +
          '<a href="/projects/' + ROOM + '/scripts?name=' + process.name + '&action=kill&pid=' + process.pid + '" class="btn btn-link btn-ajax">' +
            process.name +
            ' <span class="glyphicon glyphicon-remove"></span>' +
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
        ' <span class="glyphicon glyphicon-remove"></span>' +
      '</a>' +
    '</li>'
  );
});

socket.on('killProcess', function(pid) {
  $('[data-process=' + pid + ']').remove();
});

$(document).on('click', '.btn-ajax', function(e) {
  e.preventDefault();
  var url = $(this).attr('href');

  $.get(url);
});
