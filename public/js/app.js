var socket = io.connect();

socket.on('connect', function() {
   // Connected, let's sign-up for to receive messages for this room
   socket.emit('room', ROOM);
});

socket.on('message', function(data) {
   console.log('Incoming message:', data);
});
