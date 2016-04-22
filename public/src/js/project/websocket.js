module.exports = function (project) {
  Socket.on('init', function (data) {
    var roomIndex = _.findIndex(data, function (rooms) { return rooms.name == ROOM; });

    if (data[roomIndex]) {
      $('.console').append(project.renderLogs({
        data: {logs: data[roomIndex].logs}
      }))
      .scrollTop($('.console')[0].scrollHeight);
      $('#processes').append(project.renderProcesses({
        data: {processes: data[roomIndex].processes}
      }));
    }
  })
  .on('redirect', function (data) {
    document.location.href = data;
  })
  .on('config', function (data) {
    $('textarea[name=configFile]').html(JSON.stringify(data, null, 2));
  })
  .on('log', function (data) {
    $('.console').append(project.renderLogs({
      data: {logs: [data]}
    }))
    .scrollTop($('.console')[0].scrollHeight);
  })
  .on('cleanLogs', function (data) {
    if (data) $('.console').empty();
  })
  .on('process', function (data) {
    $('#processes').append(project.renderProcesses({
      data: {processes: [data]}
    }));
  })
  .on('killProcess', function (pid) {
    $('[data-process=' + pid + ']').remove();
  })
  .on('pkgAdd', function (data) {
    $('.pkg-list.' + data.env).append(project.renderPackages({
      data: {packages: [data]}
    }));
  })
  .on('pkgDelete', function (data) {
    $('.pkg-list.' + data.env).find('[data-pkg=' + data.name + ']').remove();
  })
  .on('packages', function (data) {
    $('.pkg-list.dev').html(project.renderPackages({
      data: {packages: data.dev}
    }));
    $('.pkg-list.prod').html(project.renderPackages({
      data: {packages: data.prod}
    }));
  })
  .on('scripts', function (data) {
    $('#scriptList').html(project.renderScripts({
      data: {scripts: data}
    }));
  });
}
