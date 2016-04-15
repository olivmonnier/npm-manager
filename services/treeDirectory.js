function formatTreeview (data) {
  var tree = [];

  loopChildren(data.children, tree);

  return tree.filter(function (k) { return k.text !== 'package.json' && k.text !== 'node_modules' });
}

function loopChildren (children, parent) {
  var childrenFolders = children.filter(function (child) { return child.type === 'directory' });
  var childrenFiles = children.filter(function (child) { return child.type === 'file' });

  [childrenFolders, childrenFiles].forEach(function (childrenType) {
    childrenType.forEach(function (child) {
      parent.push(insertChild(child));
    });
  });
}

function insertChild (child) {
  var newChild = {
    text: child.name,
    href: '#/' + child.path.replace(/\\/g, '/'),
    icon: (child.type == 'directory') ? 'glyphicon glyphicon-folder-close' : 'glyphicon glyphicon-file',
    selectedIcon: (child.type == 'directory') ? 'glyphicon glyphicon-folder-open' : 'glyphicon glyphicon-open-file'
  }
  if (child.children) {
    newChild['nodes'] = [];
    loopChildren(child.children, newChild.nodes);
  }
  return newChild;
}

module.exports = formatTreeview;
