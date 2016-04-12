module.exports = function (path) {
  var formatPath = path.slice(1).split('/');

  (formatPath[0]) ? formatPath.unshift(ROOM) : formatPath = [ROOM];

  return formatPath;
}
