var socket = io.connect();
var config = Project().config;

socket.on('connect', function(data) {
  if (ROOM !== null) {
    socket.emit('room', ROOM);
  }
});

socket.on('init', function(data) {
  var roomIndex = _.findIndex(data, function(rooms) {return rooms.name == ROOM; });

  if (data[roomIndex]) {
    $('#logs').append(config.renderLogs({
      data: {logs: data[roomIndex].logs}
    }));
    $('#processes').append(config.renderProcesses({
      data: {processes: data[roomIndex].processes}
    }));
  }
});

socket.on('log', function(data) {
   $('#logs').append(config.renderLogs({
     data: {logs: [data]}
   }));
});

socket.on('process', function(data) {
  $('#processes').append(config.renderProcesses({
    data: {processes: [data]}
  }));
});

socket.on('killProcess', function(pid) {
  $('[data-process=' + pid + ']').remove();
});

socket.on('pkgAdd', function(data) {
  $('.pkg-list.' + data.env).append(config.renderPackages({
    data: {packages: [data]}
  }));
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
