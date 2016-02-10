(function($, _) {
  var Project = function() {
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
          var config = this;
          var fileView = ace.edit('editor');
          var navPath = '';
          var optionsTree = {
            data: TreeDir,
            showBorder: false,
            collapseIcon: 'glyphicon glyphicon-triangle-bottom',
            expandIcon: 'glyphicon glyphicon-triangle-right',
            enableLinks: true,
            onNodeSelected: function(event, data) {
              navPath = '/' + data.href.slice(2).replace(/\\/g, '/');

              if(!data.nodes) {

                $.get('/projects/' + ROOM + '/files', {filePath: navPath})
                  .done(function(data) {
                    fileView.setValue(data.fileContent, -1);
                    fileView.session.setMode('ace/mode/' + data.extension);
                    fileView.setReadOnly(true);
                    $('#fileActions').html(config.renderFileEditAction());
                    showFileView();
                  });
              } else {
                $('#folderView .breadcrumb').html(config.renderBreadcrumbs({
                  data: {files: formatNavPath(navPath)}
                }));
                showFolderView();
              }
            }
          };

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

          function updateTreeDir(data) {
            optionsTree.data = data.tree;
            TreeDir = data.tree;
            $('#tree').treeview(optionsTree);
            $('#folderView .breadcrumb').html(config.renderBreadcrumbs({
              data: {files: formatNavPath(navPath)}
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
            data: {files: formatNavPath(navPath)}
          }));
          $(document).on('click', '.btn-edit-file', function() {
            fileView.setReadOnly(false);
            $('#fileActions').html(config.renderFileActions());
          });
          $(document).on('click', '.btn-add-folder', function(e) {
            e.preventDefault();
            var $this = $(this);
            var folderName = $(this).closest('form').find('input[name="folderName"]').val();

            $.get('/projects/' + ROOM + '/folders', {
              folderPath: navPath + '/' + folderName,
              action: 'add'
            }).done(function(data) {
              updateTreeDir(data);
              $this.closest('.modal').modal('hide');
            });
          });
          $(document).on('click', '.btn-add-file', function(e) {
            e.preventDefault();
            var $this = $(this);
            var fileName = $(this).closest('form').find('input[name="fileName"]').val();

            $.get('/projects/' + ROOM + '/files', {
              filePath: navPath + '/' + fileName,
              action: 'add'
            }).done(function(data) {
              updateTreeDir(data);
              $this.closest('.modal').modal('hide');
            });
          });
          $(document).on('click', '.btn-save-file', function() {
            $.post('/projects/' + ROOM + '/files', {
              filePath: navPath,
              fileContent: fileView.getValue()
            }).done(function() {
              $('#fileActions').html(config.renderFileEditAction());
            });
          });
          $(document).on('click', '.btn-cancel-file', function() {
            $.get('/projects/' + ROOM + '/files', {filePath: navPath})
              .done(function(data) {
                fileView.setReadOnly(true);
                fileView.setValue(data.fileContent);
                $('#fileActions').html(config.renderFileEditAction());
              });
          });
          $(document).on('click', '.btn-delete-file', function() {
            $.get('/projects/' + ROOM + '/files', {
              filePath: navPath,
              action: 'delete'
            }).done(function(data) {
              updateTreeDir(data);
              showFolderView();
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
          $(document).on('click', '.btn-delete-folder', function() {
            $.get('/projects/' + ROOM + '/folders', {
              action: 'delete',
              folderPath: navPath
            }).done(function(data) {
              updateTreeDir(data);
              $('#tree').treeview('selectNode', [0, { silent: false }]);
            });
          });
        },
        renderBreadcrumbs: _.template(
          '<% _.forEach(data.files, function(file) { %>' +
            '<li><%= file %></li>' +
          '<% }); %>'
        ),
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
  window.Project = Project;
}(jQuery, _));
