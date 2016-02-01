var socket = io.connect();

socket.on('connect', function(data) {
   console.log(data);
   socket.emit('room', ROOM);
});

socket.on('logs', function(data) {
  var roomIndex = _.findIndex(data, function(rooms) {return rooms.name == ROOM; });
  data[roomIndex].logs.forEach(function(log) {
    $('#logs').append(log + '<br/>');
  });
});

socket.on('log', function(data) {
   $('#logs').append(data + '<br/>');
});

$('.btn-ajax').on('click', function(e) {
  e.preventDefault();
  var url = $(this).attr('href');

  $.get(url);
});
