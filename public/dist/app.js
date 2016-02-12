(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Project = require('./project');

window.Socket = io.connect();

Socket.on('connect', function(data) {
  if (ROOM !== null) {
    Socket.emit('room', ROOM);
  }
});


$(document).ready(function() {
  if ($('#accordion').length > 0) Project().config.init();
  if ($('#project-list').length > 0) Project().list.init();

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

},{"./project":3}],2:[function(require,module,exports){
module.exports = function() {
  return {
    events: function(fileView) {
      var file = this;

      $(document).on('click', '.btn-edit-file', function() {
        fileView.setReadOnly(false);
        $('#fileActions').html(file.renderFileActions());
      });
      $(document).on('click', '.btn-save-file', function() {
        $.post('/projects/' + ROOM + '/files', {
          filePath: NavPath,
          fileContent: fileView.getValue()
        }).done(function() {
          $('#fileActions').html(file.renderFileEditAction());
        });
      });
      $(document).on('click', '.btn-cancel-file', function() {
        $.get('/projects/' + ROOM + '/files', {filePath: NavPath})
        .done(function(data) {
          fileView.setReadOnly(true);
          fileView.setValue(data.fileContent, -1);
          $('#fileActions').html(file.renderFileEditAction());
        });
      });    
    },
    renderFileActions: _.template(
      '<li>' +
      '<button class="btn btn-xs btn-warning btn-cancel-file">' +
      '<i class="glyphicon glyphicon-remove"></i>' +
      '<span>Cancel</span>' +
      '</button>' +
      '</li>' +
      '<li>' +
      '<button class="btn btn-xs btn-primary btn-save-file">' +
      '<i class="glyphicon glyphicon-save"></i>' +
      '<span>Save</span>' +
      '</button>' +
      '</li>' +
      '<li>' +
      '<button class="btn btn-xs btn-danger btn-delete-file">' +
      '<i class="glyphicon glyphicon-trash"></i>' +
      '<span>Delete</span>' +
      '</button>' +
      '</li>'
    ),
    renderFileEditAction: _.template(
      '<li><button class="btn btn-xs btn-primary btn-edit-file">' +
      '<i class="glyphicon glyphicon-edit"></i>' +
      '<span>Edit</span>' +
      '</button></li>'
    )
  }
}

},{}],3:[function(require,module,exports){
var File = require('./file');

module.exports = function() {
  return {
    list: {
      init: function() {
        var list = this;

        Socket.on('init', function(data) {
          data.forEach(function(project) {
            if (project.processes.length > 0) {
              $('[data-project=' + project.name + '] ul').append(list.renderProcesses({
                data: {project: project.name, processes: project.processes}
              }));
            }
          })
        });
      },
      renderProcesses: _.template(
        '<% _.forEach(data.processes, function(process) { %>' +
        '<li data-process="<%= process.pid %>">' +
        '<a href="/projects/<%= data.project %>/scripts?name=<%= process.name %>&action=kill&pid=<%= process.pid %>" class="btn-ajax">' +
        '<%= process.name %>' +
        ' <i class="glyphicon glyphicon-remove"></i>' +
        '</a>' +
        '</li>' +
        '<% }); %>'
      )
    },
    config: {
      init: function() {
        window.NavPath = '/';
        var nodeSelected = 0;
        var parentNodeSelected = 0;
        var config = this;
        var fileView = ace.edit('editor');
        var optionsTree = {
          data: TreeDir,
          showBorder: false,
          collapseIcon: 'glyphicon glyphicon-triangle-bottom',
          expandIcon: 'glyphicon glyphicon-triangle-right',
          enableLinks: true,
          onNodeSelected: function(event, data) {
            NavPath = '/' + data.href.slice(2).replace(/\\/g, '/');
            nodeSelected = data.nodeId;
            parentNodeSelected = $('#tree').treeview('getParent', data.nodeId).nodeId;

            if(!data.nodes) {

              $.get('/projects/' + ROOM + '/files', {filePath: NavPath})
              .done(function(data) {
                fileView.setValue(data.fileContent, -1);
                fileView.session.setMode('ace/mode/' + data.extension);
                fileView.setReadOnly(true);
                $('#fileActions').html(File().renderFileEditAction());
                showFileView();
              });
            } else {
              $('#folderView .breadcrumb').html(config.renderBreadcrumbs({
                data: {files: formatNavPath(NavPath)}
              }));
              folderActionsAuth();
              showFolderView();
            }
          }
        };

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

        function updateTreeDir(data, nodeExist) {
          nodeExist = nodeExist || false;
          optionsTree.data = data.tree;
          TreeDir = data.tree;
          $('#tree').treeview(optionsTree);
          $('#tree').treeview('revealNode', [(nodeExist) ? nodeSelected : parentNodeSelected, {silent: false }]);
          $('#tree').treeview('selectNode', [(nodeExist) ? nodeSelected : parentNodeSelected, {silent: false }]);
          $('#tree').treeview('expandNode', [(nodeExist) ? nodeSelected : parentNodeSelected, {silent: false }]);
          $('#folderView .breadcrumb').html(config.renderBreadcrumbs({
            data: {files: formatNavPath(NavPath)}
          }));
        }

        fileView.setReadOnly(true);
        fileView.$blockScrolling = Infinity;
        fileView.setTheme("ace/theme/tomorrow_night");
        fileView.setOptions({
          enableBasicAutocompletion: true,
          enableSnippets: true,
          enableLiveAutocompletion: true
        });

        Socket.on('init', function(data) {
          var roomIndex = _.findIndex(data, function(rooms) {return rooms.name == ROOM; });

          if (data[roomIndex]) {
            $('#logs').append(config.renderLogs({
              data: {logs: data[roomIndex].logs}
            }));
            $('#processes').append(config.renderProcesses({
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
          $('#logs').append(config.renderLogs({
            data: {logs: [data]}
          }));
        })
        .on('process', function(data) {
          $('#processes').append(config.renderProcesses({
            data: {processes: [data]}
          }));
        })
        .on('killProcess', function(pid) {
          $('[data-process=' + pid + ']').remove();
        })
        .on('pkgAdd', function(data) {
          $('.pkg-list.' + data.env).append(config.renderPackages({
            data: {packages: [data]}
          }));
        })
        .on('pkgDelete', function(data) {
          $('.pkg-list.' + data.env).find('[data-pkg=' + data.name + ']').remove();
        })
        .on('packages', function(data) {
          $('.pkg-list.dev').html(config.renderPackages({
            data: {packages: data.dev}
          }));
          $('.pkg-list.prod').html(config.renderPackages({
            data: {packages: data.prod}
          }));
        })
        .on('scripts', function(data) {
          $('#scriptList').html(config.renderScripts({
            data: {scripts: data}
          }));
        });
        $('#tree').treeview(optionsTree);
        $('#folderView .breadcrumb').html(config.renderBreadcrumbs({
          data: {files: formatNavPath(NavPath)}
        }));
        File().events(fileView);
        folderActionsAuth();
        $(document).on('click', '.btn-show-app', function(e) {
          e.preventDefault();
          var url = $(this).attr('href');

          $('#contentAppShow').removeClass('hide').animate({bottom: 0}, 1000, function() {
            $(this).append(_.template(
              '<iframe src="<%= data.url %>"></iframe>'
            )({data: {url: url}}));
          });
        });
        $(document).on('click', '.btn-notshow-app', function(e) {
          $('#contentAppShow').animate({bottom: '999px'}, 1000, function() {
            $(this).addClass('hide').find('iframe').remove();
          });
        });
        $(document).on('click', '.btn-add-folder', function(e) {
          e.preventDefault();
          var $this = $(this);
          var folderName = $(this).closest('form').find('input[name="folderName"]').val();

          $.get('/projects/' + ROOM + '/folders', {
            folderPath: NavPath + '/' + folderName,
            action: 'add'
          }).done(function(data) {
            updateTreeDir(data, true);
            $this.closest('.modal').modal('hide');
          });
        });
        $(document).on('click', '.btn-add-pkg', function() {
          var parent = $(this).parent();

          $.get('/projects/' + ROOM + '/packages', {
            action: 'add',
            name: parent.find('[name=pkgName]').val(),
            version: parent.find('[name=version]').val(),
            env: parent.find('[name=env]').val()
          });
        });
        $(document).on('click', '.btn-rename-folder', function(e) {
          e.preventDefault();
          var $this = $(this);
          var folderName = $(this).closest('form').find('input[name="folderName"]').val();

          $.get('/projects/' + ROOM + '/folders', {
            action: 'rename',
            folderPath: NavPath,
            folderName: folderName
          }).done(function(data) {
            NavPath = '';
            updateTreeDir(data, true);
            $this.closest('.modal').modal('hide');
          });
        });
        $(document).on('click', '.btn-delete-folder', function() {
          $.get('/projects/' + ROOM + '/folders', {
            action: 'delete',
            folderPath: NavPath
          }).done(function(data) {
            NavPath = '';
            updateTreeDir(data, false);
          });
        });
        $(document).on('click', '.btn-add-file', function(e) {
          e.preventDefault();
          var $this = $(this);
          var fileName = $(this).closest('form').find('input[name="fileName"]').val();

          $.get('/projects/' + ROOM + '/files', {
            filePath: NavPath + '/' + fileName,
            action: 'add'
          }).done(function(data) {
            updateTreeDir(data);
            $this.closest('.modal').modal('hide');
          });
        });
        $(document).on('click', '.btn-delete-file', function() {
          $.get('/projects/' + ROOM + '/files', {
            filePath: NavPath,
            action: 'delete'
          }).done(function(data) {
            updateTreeDir(data, false);
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
        '<a href="https://www.npmjs.com/search?q=<%= pkg.name %>" target="_blank"><%= pkg.name %> - <%= pkg.version %></a>' +
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
  }
};

},{"./file":2}]},{},[1]);
