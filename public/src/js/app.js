var Projects = require('./projects');
var Project = require('./project');

window.Socket = io.connect();

Socket.on('connect', function(data) {
  if (ROOM !== null) {
    Socket.emit('room', ROOM);
  }
});


$(document).ready(function() {
  if ($('#accordion').length > 0) Project().initialize();
  if ($('#project-list').length > 0) Projects().initialize();

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
