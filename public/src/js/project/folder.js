module.exports = function (treeDir) {
  $(document).on('click', '.btn-add-folder', function (e) {
    e.preventDefault();
    var $this = $(this);
    var folderName = $(this).closest('form').find('input[name="folderName"]').val();

    $.get('/projects/' + ROOM + '/folders', {
      folderPath: NavPath + '/' + folderName,
      action: 'add'
    }).done(function (data) {
      treeDir.updateTreeDir(data, true);
      $this.closest('.modal').modal('hide');
    });
  })
  .on('click', '.btn-rename-folder', function (e) {
    e.preventDefault();
    var $this = $(this);
    var folderName = $(this).closest('form').find('input[name="folderName"]').val();

    $.get('/projects/' + ROOM + '/folders', {
      action: 'rename',
      folderPath: NavPath,
      folderName: folderName
    }).done(function (data) {
      NavPath = '';
      treeDir.updateTreeDir(data, true);
      $this.closest('.modal').modal('hide');
    });
  })
  .on('click', '.btn-delete-folder', function () {
    if (confirm('Are you shure to delete this folder ?')) {
      $.get('/projects/' + ROOM + '/folders', {
        action: 'delete',
        folderPath: NavPath
      }).done(function (data) {
        NavPath = '';
        treeDir.updateTreeDir(data, false);
      });
    }
  })
}
