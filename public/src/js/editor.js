module.exports = function (fullAction) {
  var fileView;

  return {
    initialize: function () {
      var localOptions = this.loadLocalOptions();

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

      if (localOptions) {
        fileView.setOptions({ fontSize: localOptions.fontSize + 'px' });
        fileView.getSession().setTabSize(localOptions.tabSize);
        fileView.getSession().setUseWrapMode(localOptions.wrap);

        $('input[name=fontSizeEditor]').val(localOptions.fontSize);
        $('input[name=tabSizeEditor]').val(localOptions.tabSize);
        $('input[name=wrapEditor]').prop('checked', localOptions.wrap);
      }

      return fileView;
    },
    saveLocalOptions: function (options) {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('editor', JSON.stringify(options));
      } else {
        throw new Error('localStorage unsupported');
      }
    },
    loadLocalOptions: function () {
      if (typeof localStorage !== 'undefined') {
        return JSON.parse(localStorage.getItem('editor'));
      } else {
        throw new Error('localStorage unsupported');
      }
    },
    events: function () {
      var _this = this;

      $(document).on('click', '.btn-edit-file', function () {
        fileView.setReadOnly(false);
        $('#fileActions').html(_this.renderFileSecondaryActions({
          data: {project: ROOM, filePath: NavPath, advance: fullAction}
        }));
      });
      $(document).on('click', '.btn-save-file', function () {
        $.post('/projects/' + ROOM + '/files', {
          filePath: NavPath,
          fileContent: fileView.getValue()
        }).done(function () {
          $('#fileActions').html(_this.renderFilePrimaryActions({
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
          $('#fileActions').html(_this.renderFilePrimaryActions({
            data: {advance: fullAction, project: ROOM, filePath: NavPath}
          }));
        });
      });
      $(document).on('click', '.btn-editor-options', function (e) {
        e.preventDefault();

        var fontSize = $('input[name=fontSizeEditor]').val();
        var tabSize = $('input[name=tabSizeEditor]').val();
        var wrap = $('input[name=wrapEditor]').is(':checked');

        if (fontSize !== '') fileView.setOptions({ fontSize: fontSize + 'px' });
        if (tabSize !== '') fileView.getSession().setTabSize(tabSize);
        fileView.getSession().setUseWrapMode(wrap);

        _this.saveLocalOptions({
          fontSize: fontSize,
          tabSize: tabSize,
          wrap: wrap
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
