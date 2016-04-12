module.exports = function (treeDir) {
  $(document).on('click', '.btn-add-file', function (e) {
    e.preventDefault();
    var $this = $(this);
    var fileName = $(this).closest('form').find('input[name="fileName"]').val();

    $.get('/projects/' + ROOM + '/files', {
      filePath: NavPath + '/' + fileName,
      action: 'add'
    }).done(function (data) {
      treeDir.updateTreeDir(data);
      $this.closest('.modal').modal('hide');
    });
  })
  .on('click', '.btn-delete-file', function () {
    $.get('/projects/' + ROOM + '/files', {
      filePath: NavPath,
      action: 'delete'
    }).done(function (data) {
      treeDir.updateTreeDir(data, false);
      treeDir.unfoldView(false);
    });
  });
}
