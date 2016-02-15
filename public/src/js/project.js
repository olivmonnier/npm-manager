var File = require('./file');

function selectNodeIdByUrl() {
  var hashUrl = $(location).attr('hash');
  var arrayUrl = hashUrl.split(/\//);
  var nodeEl = [];
  var nodeId = 0;
  arrayUrl.shift();

  arrayUrl.forEach(function(node) {
    nodeEl = $('#tree a:contains("' + node + '")');
    if(nodeEl.length > 0) {
      nodeId = nodeEl.closest('li').data('nodeid');
      $('#tree').treeview('revealNode', [nodeId, {silent: false }]);
      $('#tree').treeview('selectNode', [nodeId, {silent: false }]);
      $('#tree').treeview('expandNode', [nodeId, {silent: false }]);
    }
  });
}

function folderActionsAuth() {
  $('#folderActions li [data-target="#modalRenameFolder"]')[(NavPath == '/') ? 'addClass' : 'removeClass']('hidden');
  $('#folderActions li .btn-delete-folder')[(NavPath == '/') ? 'addClass' : 'removeClass']('hidden');
}

function formatNavPath(path) {
  var formatPath = path.slice(1).split('/');

  (formatPath[0]) ? formatPath.unshift(ROOM) : formatPath = [ROOM];

  return formatPath;
}

function showFileView() {
  $('#folderView').fadeOut('slow');
  $('#fileView').fadeIn('slow');
}

function showFolderView() {
  $('#fileView').fadeOut('slow');
  $('#folderView').fadeIn('slow');
}

module.exports = function() {
  window.NavPath = '/';
  var project;
  var fileView = File(true).initialize();
  var optionsTree = {
    data: TreeDir,
    showBorder: false,
    collapseIcon: 'glyphicon glyphicon-triangle-bottom',
    expandIcon: 'glyphicon glyphicon-triangle-right',
    enableLinks: true,
    highlightSelected: false,
    onNodeSelected: function(event, data) {
      NavPath = '/' + data.href.slice(2);
      nodeSelected = data.nodeId;
      parentNodeSelected = $('#tree').treeview('getParent', data.nodeId).nodeId;

      if(!data.nodes) {

        $.get('/projects/' + ROOM + '/files', {filePath: NavPath})
        .done(function(data) {
          fileView.setValue(data.fileContent, -1);
          fileView.session.setMode('ace/mode/' + data.extension);
          fileView.setReadOnly(true);
          $('#fileActions').html(File(true).renderFileEditAction());
          showFileView();
        });
      } else {
        $('#folderView .breadcrumb').html(project.renderBreadcrumbs({
          data: {files: formatNavPath(NavPath)}
        }));
        folderActionsAuth();
        showFolderView();
      }
    }
  };
  return {
    initialize: function() {
      project = this;
      var nodeSelected = 0;
      var parentNodeSelected = 0;

      $('#tree').treeview(optionsTree);
      selectNodeIdByUrl();
      folderActionsAuth();
      project.events();
    },
    updateTreeDir: function(data, nodeExist) {
      nodeExist = nodeExist || false;
      optionsTree.data = data.tree;
      TreeDir = data.tree;
      $('#tree').treeview(optionsTree);
      $('#tree').treeview('revealNode', [(nodeExist) ? nodeSelected : parentNodeSelected, {silent: false }]);
      $('#tree').treeview('selectNode', [(nodeExist) ? nodeSelected : parentNodeSelected, {silent: false }]);
      $('#tree').treeview('expandNode', [(nodeExist) ? nodeSelected : parentNodeSelected, {silent: false }]);
      $('#folderView .breadcrumb').html(project.renderBreadcrumbs({
        data: {files: formatNavPath(NavPath)}
      }));
    },
    events: function() {
      Socket.on('init', function(data) {
        var roomIndex = _.findIndex(data, function(rooms) {return rooms.name == ROOM; });

        if (data[roomIndex]) {
          $('#logs').append(project.renderLogs({
            data: {logs: data[roomIndex].logs}
          }));
          $('#processes').append(project.renderProcesses({
            data: {processes: data[roomIndex].processes}
          }));
        }
      })
      .on('redirect', function(data) {
        document.location.href = data;
      })
      .on('config', function(data) {
        $('textarea[name=configFile]').html(JSON.stringify(data, null, 2));
      })
      .on('log', function(data) {
        $('#logs').append(project.renderLogs({
          data: {logs: [data]}
        }));
      })
      .on('process', function(data) {
        $('#processes').append(project.renderProcesses({
          data: {processes: [data]}
        }));
      })
      .on('killProcess', function(pid) {
        $('[data-process=' + pid + ']').remove();
      })
      .on('pkgAdd', function(data) {
        $('.pkg-list.' + data.env).append(project.renderPackages({
          data: {packages: [data]}
        }));
      })
      .on('pkgDelete', function(data) {
        $('.pkg-list.' + data.env).find('[data-pkg=' + data.name + ']').remove();
      })
      .on('packages', function(data) {
        $('.pkg-list.dev').html(project.renderPackages({
          data: {packages: data.dev}
        }));
        $('.pkg-list.prod').html(project.renderPackages({
          data: {packages: data.prod}
        }));
      })
      .on('scripts', function(data) {
        $('#scriptList').html(project.renderScripts({
          data: {scripts: data}
        }));
      });
      $('#folderView .breadcrumb').html(project.renderBreadcrumbs({
        data: {files: formatNavPath(NavPath)}
      }));
      $(document).on('click', '.btn-show-app', function(e) {
        e.preventDefault();
        var url = $(this).attr('href');

        $('#contentAppShow').removeClass('hide').animate({bottom: 0}, 1000, function() {
          $(this).append(_.template(
            '<iframe src="<%= data.url %>"></iframe>'
          )({data: {url: url}}));
        });
      })
      .on('click', '.btn-notshow-app', function(e) {
        $('#contentAppShow').animate({bottom: '999px'}, 1000, function() {
          $(this).addClass('hide').find('iframe').remove();
        });
      })
      .on('click', '.btn-add-folder', function(e) {
        e.preventDefault();
        var $this = $(this);
        var folderName = $(this).closest('form').find('input[name="folderName"]').val();

        $.get('/projects/' + ROOM + '/folders', {
          folderPath: NavPath + '/' + folderName,
          action: 'add'
        }).done(function(data) {
          project.updateTreeDir(data, true);
          $this.closest('.modal').modal('hide');
        });
      })
      .on('click', '.btn-add-pkg', function() {
        var parent = $(this).parent();

        $.get('/projects/' + ROOM + '/packages', {
          action: 'add',
          name: parent.find('[name=pkgName]').val(),
          version: parent.find('[name=version]').val(),
          env: parent.find('[name=env]').val()
        });
      })
      .on('click', '.btn-rename-folder', function(e) {
        e.preventDefault();
        var $this = $(this);
        var folderName = $(this).closest('form').find('input[name="folderName"]').val();

        $.get('/projects/' + ROOM + '/folders', {
          action: 'rename',
          folderPath: NavPath,
          folderName: folderName
        }).done(function(data) {
          NavPath = '';
          project.updateTreeDir(data, true);
          $this.closest('.modal').modal('hide');
        });
      })
      .on('click', '.btn-delete-folder', function() {
        $.get('/projects/' + ROOM + '/folders', {
          action: 'delete',
          folderPath: NavPath
        }).done(function(data) {
          NavPath = '';
          project.updateTreeDir(data, false);
        });
      })
      .on('click', '.btn-add-file', function(e) {
        e.preventDefault();
        var $this = $(this);
        var fileName = $(this).closest('form').find('input[name="fileName"]').val();

        $.get('/projects/' + ROOM + '/files', {
          filePath: NavPath + '/' + fileName,
          action: 'add'
        }).done(function(data) {
          project.updateTreeDir(data);
          $this.closest('.modal').modal('hide');
        });
      })
      .on('click', '.btn-delete-file', function() {
        $.get('/projects/' + ROOM + '/files', {
          filePath: NavPath,
          action: 'delete'
        }).done(function(data) {
          project.updateTreeDir(data, false);
          showFolderView();
        });
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
      '<a href="/projects/' + ROOM + '/scripts?name=<%= process.name %>&action=kill&pid=<%= process.pid %>" class="btn btn-link btn-ajax">' +
      '<%= process.name %>' +
      ' <i class="glyphicon glyphicon-remove"></i>' +
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
