var Projects = require('./projects');
var Project = require('./project');
var Editor = require('./editor');

window.Socket = io.connect();

Socket.on('connect', function (data) {
  if (ROOM !== null) {
    Socket.emit('room', ROOM);
  }
});

$(document).ready(function () {
  if ($('#accordion').length > 0) Project().initialize();
  if ($('#project-list').length > 0) Projects().initialize();

  if ($('body > #fileView').length > 0) {
    var fileEdit = Editor(false);

    fileEdit.initialize();
    $('#fileActions').html(fileEdit.renderFileEditAction());
  };

  $(document).on('click', '.btn-ajax', function (e) {
    e.preventDefault();

    $.get($(this).attr('href'));
  });

  $(document).on('click', '.submit-ajax', function (e) {
    e.preventDefault();

    var form = $(this).closest('form');
    var datas = form.serialize();
    var url = $(this).data('url');
    var redirect = $(this).data('redirect');

    $.post(url, datas)
      .done(function () {
        if (redirect) document.location.href = redirect;
      });
  });
});
