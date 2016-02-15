module.exports = function() {
  return {
    initialize: function() {
      var projects = this;

      Socket.on('init', function(data) {
        data.forEach(function(project) {
          if (project.processes.length > 0) {
            $('[data-project=' + project.name + '] ul').append(projects.renderProcesses({
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
  }
}
