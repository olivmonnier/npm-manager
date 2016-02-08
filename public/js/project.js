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
          var fileView = ace.edit('fileView');

          //fileView.setReadOnly(true);
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
          $('#tree').treeview({
            data: TreeDir,
            showBorder: false,
            collapseIcon: 'glyphicon glyphicon-triangle-bottom',
            expandIcon: 'glyphicon glyphicon-triangle-right',
            enableLinks: true,
            onNodeSelected: function(event, data) {
              if(!data.nodes) {
                var filePath = '/' + data.href.slice(2).replace(/\\/g, '/');

                $.get('/projects/' + ROOM + '/files', {filepath: filePath})
                  .done(function(data) {
                    fileView.setValue(data.fileContent, -1);
                    fileView.session.setMode('ace/mode/' + data.extension);
                  });
              }
            }
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
        },
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
