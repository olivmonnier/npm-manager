(function($, _) {
  var Project = function() {
    return {
      config: {
        init: function() {
          $(document).on('click', '.btn-add-pkg', function() {
            var parent = $(this).parent();

            $.get('/projects/' + parent.find('[name=name]').val() + '/packages', {
              action: 'add',
              name: parent.find('[name=pkgName]').val(),
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
