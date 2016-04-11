function folderActionsAuth() {
  $('#folderActions li [data-target="#modalRenameFolder"]')[(NavPath == '/') ? 'addClass' : 'removeClass']('hidden');
  $('#folderActions li .btn-delete-folder')[(NavPath == '/') ? 'addClass' : 'removeClass']('hidden');
}

function unfoldView (file) {
  $('#fileView')[file ? 'fadeIn' : 'fadeOut']('slow');
  $('#folderView')[file ? 'fadeOut' : 'fadeIn']('slow');
}

module.exports = function (fileView) {
  var optionsTree = {
    data: TreeDir,
    showBorder: false,
    collapseIcon: 'glyphicon glyphicon-triangle-bottom',
    expandIcon: 'glyphicon glyphicon-triangle-right',
    enableLinks: true,
    highlightSelected: false,
    onNodeSelected: function(event, data) {
      NavPath = '/' + data.href.slice(2);
      nodeSelected = data.nodeId;
      parentNodeSelected = $('#tree').treeview('getParent', data.nodeId).nodeId;

      if(!data.nodes) {

        $.get('/projects/' + ROOM + '/files', {filePath: NavPath})
        .done(function(data) {
          fileView.setValue(data.fileContent, -1);
          fileView.session.setMode('ace/mode/' + data.extension);
          fileView.setReadOnly(true);
          $('#fileActions').html(File(true).renderFileEditAction());
          unfoldView(true);
        });
      } else {
        $('#folderView .breadcrumb').html(project.renderBreadcrumbs({
          data: {files: formatNavPath(NavPath)}
        }));
        folderActionsAuth();
        unfoldView(false);
      }
    }
  };

  return {
    initialize: function () {
      var hashUrl = $(location).attr('hash');
      var arrayUrl = hashUrl.split(/\//);
      var nodeEl = [];
      var nodeId = 0;

      $('#tree').treeview(optionsTree);

      arrayUrl.shift();

      arrayUrl.forEach(function(node) {
        nodeEl = $('#tree a:contains("' + node + '")');
        if(nodeEl.length > 0) {
          nodeId = nodeEl.closest('li').data('nodeid');

          ['revealNode', 'selectNode', 'expandNode'].forEach(function(key) {
            $('#tree').treeview(key, [nodeId, {silent: false }]);
          });
        }
      });

      folderActionsAuth();
    },
    updateTreeDir: function (data, nodeExist) {
      nodeExist = nodeExist || false;
      optionsTree.data = data.tree;
      TreeDir = data.tree;
      $('#tree').treeview(optionsTree);
      ['revealNode', 'selectNode', 'expandNode'].forEach(function (key) {
        $('#tree').treeview(key, [(nodeExist) ? nodeSelected : parentNodeSelected, {silent: false }]);
      });
      $('#folderView .breadcrumb').html(project.renderBreadcrumbs({
        data: {files: formatNavPath(NavPath)}
      }));
    }
  }
}
