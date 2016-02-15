module.exports = function(full) {
  var fileView;

  return {
    initialize: function() {
      fileView = ace.edit('editor');
      fileView.setReadOnly(true);
      fileView.$blockScrolling = Infinity;
      fileView.setTheme("ace/theme/tomorrow_night");
      fileView.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true
      });
      this.events(full);
      return fileView;
    },
    events: function(full) {
      var file = this;

      $(document).on('click', '.btn-edit-file', function() {
        fileView.setReadOnly(false);
        $('#fileActions').html(file.renderFileActions({
          data: {project: ROOM, filePath: NavPath, advance: full}
        }));
      });
      $(document).on('click', '.btn-save-file', function() {
        $.post('/projects/' + ROOM + '/files', {
          filePath: NavPath,
          fileContent: fileView.getValue()
        }).done(function() {
          $('#fileActions').html(file.renderFileEditAction());
          fileView.setReadOnly(true);
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
      '<% if (data.advance){ %>' +
      '<li>' +
      '<a class="btn btn-xs btn-default btn-toggle-file" href="/projects/<%= data.project %>/file?path=<%= data.filePath %>" target="_blank">' +
      '<i class="glyphicon glyphicon-new-window"></i>' +
      '<span>Window</span>' +
      '</a>' +
      '</li>' +
      '<li>' +
      '<button class="btn btn-xs btn-danger btn-delete-file">' +
      '<i class="glyphicon glyphicon-trash"></i>' +
      '<span>Delete</span>' +
      '</button>' +
      '</li>' +
      '<% } %>'
    ),
    renderFileEditAction: _.template(
      '<li><button class="btn btn-xs btn-primary btn-edit-file">' +
      '<i class="glyphicon glyphicon-edit"></i>' +
      '<span>Edit</span>' +
      '</button></li>'
    )
  }
}
