function cpuAverage(cpus) {
  var totalIdle = 0, totalTick = 0;

  cpus.forEach(function(cpu) {
    for (type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  });

  return {
    idle: totalIdle / cpus.length,
    total: totalTick / cpus.length,
    percent: 100 * totalIdle / totalTick
  };
}
module.exports = function() {
  return {
    initialize: function() {
      var projects = this;

      Socket.on('init', function(data) {
        data.forEach(function(project) {
          if (project.processes.length > 0) {
            $('[data-project=' + project.name + '] ul.processing').append(projects.renderProcesses({
              data: {project: project.name, processes: project.processes}
            }));
          }
        });
      })
      .on('killProcess', function(pid) {
        $('[data-process=' + pid + ']').remove();
      })
      .on('monitor', function(data) {
        $('.monitor tbody tr').html(projects.renderMonitor({
          data: {
            cpusUsage: (100 - cpuAverage(data.cpus).percent).toFixed(2),
            memoryTotalUsed: ((data.totalmem - data.freemem) / 1000000).toFixed(2),
            memoryTotal: (data.totalmem / 1000000).toFixed(2),
            memoryFree: (data.freemem / 1000000).toFixed(2)}
        }));
      });
    },
    renderProcesses: _.template(
      '<% _.forEach(data.processes, function(process) { %>' +
      '<li data-process="<%= process.pid %>">' +
      '<a href="/projects/<%= data.project %>/scripts?name=<%= process.name %>&action=kill&pid=<%= process.pid %>" class="badge btn-ajax">' +
      '<%= process.name %>' +
      ' <i class="glyphicon glyphicon-remove-circle"></i>' +
      '</a>' +
      '</li>' +
      '<% }); %>'
    ),
    renderMonitor: _.template(
      '<td><%= data.cpusUsage %> %</td>' +
      '<td><%= data.memoryTotalUsed %> (<%= (data.memoryTotalUsed / data.memoryTotal * 100).toFixed(2) %>%)</td>' +
      '<td><%= data.memoryFree %> (<%= (data.memoryFree / data.memoryTotal * 100).toFixed(2) %>%)</td>' +
      '<td><%= data.memoryTotal %></td>'
    )
  }
}
