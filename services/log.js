module.exports = function(error, stdout, stderr) {
  if (error) return console.log(error);
  console.log(stdout)
  return stdout;
}
