var formatNavPath = require('./formatNavpath');

var fileEvents = require('./project/file');
var folderEvents = require('./project/folder');
var treeDirAction = require('./project/treeDirectory');
var ws = require('./project/websocket');

module.exports = function () {
  window.NavPath = '/';
  var project;

  return {
    initialize: function () {
      project = this;

      var treeDir = treeDirAction(project);
      treeDir.initialize();
      project.events();
      project.updateBreadcrumb(NavPath);
      fileEvents(treeDir);
      folderEvents(treeDir);
      ws(project);
    },
    updateBreadcrumb: function (navPath) {
      $('#folderView .breadcrumb').html(project.renderBreadcrumbs({
        data: {files: formatNavPath(navPath)}
      }));
    },
    events: function () {
      $(document).on('click', '.btn-show-app', function (e) {
        e.preventDefault();
        var url = $(this).attr('href');

        if (!$('iframe').is(':visible')) {
          $('#contentAppShow').removeClass('hide').animate({bottom: 0}, 1000, function () {
            $(this).append(_.template(
              '<iframe src="<%= data.url %>"></iframe>'
            )({data: {url: url}}));
          });
        }
      })
      .on('click', '.btn-notshow-app', function (e) {
        $('#contentAppShow').animate({bottom: '999px'}, 1000, function () {
          $(this).addClass('hide').find('iframe').remove();
        });
      })
      .on('click', '.btn-add-pkg', function () {
        var parent = $(this).parent();

        $.get('/projects/' + ROOM + '/packages', {
          action: 'add',
          name: parent.find('[name=pkgName]').val(),
          version: parent.find('[name=version]').val(),
          env: parent.find('[name=env]').val()
        });
      })
      .on('click', '.btn-config', function () {
        var $config = $('#config');
        $config.slideToggle('normal', function () {
          if (!$config.is(':visible')) {
            $config.removeAttr('style');
          }
        });
      })
      .on('click', '.btn-tree', function () {
        var $contentLeft = $('#contentLeft');

        if ($contentLeft.attr('style')) {
          $contentLeft.animate({'left': '-250px'}, 'normal', function () {
            $contentLeft.removeAttr('style');
          });
        } else {
          $contentLeft.animate({'left': '0'}, 'normal');
        }

      });
    },
    renderBreadcrumbs: _.template(
      '<% _.forEach(data.files, function(file) { %>' +
      '<li><%= file %></li>' +
      '<% }); %>'
    ),
    renderLogs: _.template(
      '<% _.forEach(data.logs, function(log) { %>' +
      '<%= log %><br/>' +
      '<% }); %>'
    ),
    renderPackages: _.template(
      '<% _.forEach(data.packages, function(pkg) { %>' +
      '<li class="list-group-item" data-pkg="<%= pkg.name %>">' +
      '<a href="https://www.npmjs.com/package/<%= pkg.name %>" target="_blank"><%= pkg.name %> - <%= pkg.version %></a>' +
      '<div class="pull-right">' +
      '<a class="btn btn-warning btn-ajax" href="/projects/' + ROOM + '/packages?name=<%= pkg.name %>&env=<%= pkg.env %>&action=delete">' +
      '<i class="glyphicon glyphicon-trash"></i>' +
      '</a>' +
      '</div>' +
      '</li>' +
      '<% }); %>'
    ),
    renderProcesses: _.template(
      '<% _.forEach(data.processes, function(process) { %>' +
      '<li data-process="<%= process.pid %>">' +
      '<a href="/projects/' + ROOM + '/scripts?name=<%= process.name %>&action=kill&pid=<%= process.pid %>" class="badge btn-ajax">' +
      '<%= process.name %>' +
      ' <i class="glyphicon glyphicon-remove-circle"></i>' +
      '</a>' +
      '</li>' +
      '<% }); %>'
    ),
    renderScripts: _.template(
      '<% _.forEach(data.scripts, function(script) { %>' +
      '<li>' +
      '<a class="btn btn-primary btn-ajax" href="/projects/' + ROOM + '/scripts?name=<%= script %>&action=exec">' +
      '<%= script %>' +
      '</a>' +
      '</li>' +
      '<% }); %>'
    )
  }
};
