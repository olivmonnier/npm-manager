module.exports = function (fullAction) {
  var fileView;

  return {
    initialize: function () {
      fileView = ace.edit('editor');
      fileView.setReadOnly(true);
      fileView.$blockScrolling = Infinity;
      fileView.setTheme("ace/theme/tomorrow_night");
      fileView.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true
      });
      this.events();
      return fileView;
    },
    events: function () {
      var file = this;

      $(document).on('click', '.btn-edit-file', function () {
        fileView.setReadOnly(false);
        $('#fileActions').html(file.renderFileSecondaryActions({
          data: {project: ROOM, filePath: NavPath, advance: fullAction}
        }));
      });
      $(document).on('click', '.btn-save-file', function () {
        $.post('/projects/' + ROOM + '/files', {
          filePath: NavPath,
          fileContent: fileView.getValue()
        }).done(function () {
          $('#fileActions').html(file.renderFilePrimaryActions({
            data: {advance: fullAction, project: ROOM, filePath: NavPath}
          }));
          fileView.setReadOnly(true);
        });
      });
      $(document).on('click', '.btn-cancel-file', function () {
        $.get('/projects/' + ROOM + '/files', {filePath: NavPath})
        .done(function (data) {
          fileView.setReadOnly(true);
          fileView.setValue(data.fileContent, -1);
          $('#fileActions').html(file.renderFilePrimaryActions({
            data: {advance: fullAction, project: ROOM, filePath: NavPath}
          }));
        });
      });
    },
    renderFileSecondaryActions: _.template(
      '<li>' +
      '<button class="btn btn-xs btn-primary btn-cancel-file">' +
      '<i class="glyphicon glyphicon-remove"></i>' +
      '<span>Cancel</span>' +
      '</button>' +
      '</li>' +
      '<li>' +
      '<button class="btn btn-xs btn-success btn-save-file">' +
      '<i class="glyphicon glyphicon-save"></i>' +
      '<span>Save</span>' +
      '</button>' +
      '</li>' +
      '<% if (data.advance){ %>' +
      '<li>' +
      '<button class="btn btn-xs btn-danger btn-delete-file">' +
      '<i class="glyphicon glyphicon-trash"></i>' +
      '<span>Delete</span>' +
      '</button>' +
      '</li>' +
      '<% } %>'
    ),
    renderFilePrimaryActions: _.template(
      '<% if (data.advance){ %>' +
      '<li>' +
      '<a class="btn btn-primary btn-toggle-file" href="/projects/<%= data.project %>/file?path=<%= data.filePath %>" target="_blank">' +
      '<i class="glyphicon glyphicon-new-window"></i>' +
      '<span>Fullscreen</span>' +
      '</a>' +
      '</li>' +
      '<% } %>' +
      '<li><button class="btn btn-primary btn-edit-file">' +
      '<i class="glyphicon glyphicon-edit"></i>' +
      '<span>Edit</span>' +
      '</button></li>'
    )
  }
}
