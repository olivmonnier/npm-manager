var socket = io.connect();

socket.on('connect', function() {
   socket.emit('room', ROOM);
});

socket.on('log', function(data) {
   $('#logs').append(data + '<br/>');
});

$('.btn-ajax').on('click', function(e) {
  e.preventDefault();
  var url = $(this).attr('href');

  $.get(url);
});
