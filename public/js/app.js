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

socket.on('packages', function(data) {
  $('.pkg-list.dev').html(config.renderPackages({
    data: {packages: data.dev}
  }));
  $('.pkg-list.prod').html(config.renderPackages({
    data: {packages: data.prod}
  }));
});

socket.on('scripts', function(data) {
  $('#scriptList').html(config.renderScripts({
    data: {scripts: data}
  }));
});

$(document).ready(function() {
  config.init();

  $(document).on('click', '.btn-ajax', function(e) {
    e.preventDefault();

    $.get($(this).attr('href'));
  });
  $(document).on('click', '.submit-ajax', function(e) {
    e.preventDefault();

    var form = $(this).closest('form');
    var datas = form.serialize();

    $[form.attr('method').toLowerCase()](form.attr('action'), datas);
  });
});
