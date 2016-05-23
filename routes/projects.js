var express = require('express');
var router = express.Router();

// Services
var Pkg = require('../services/pkg');
var Proc = require('../services/process');
var Project = require('../services/project');

module.exports = function (io) {
  router.route('/')
    .get(function(req, res) {
      return res.render('projects/list', {
        title: 'Projects',
        projects: Project().list()
      });
    });

  router.route('/new')
    .get(function(req, res) {
      return res.render('projects/new', {
        title: 'New Project'
      });
    })
    .post(function(req, res) {
      Project(req.body.name).create(req.body);

      if (req.body.pkgDev) {
        Pkg(req.body.name, io).add(req.body.pkgDev, true);
      }
      if (req.body.pkgProd) {
        Pkg(req.body.name, io).add(req.body.pkgProd, false);
      }
      return res.redirect('/projects');
    });

  router.route('/clone')
    .post(function(req, res) {
      Project('.tmp', io).clone(req.body.gitUrl);

      return res.status(200).end();
    });

  router.route('/:name')
    .get(function(req, res) {
      if (!Project(req.params.name).hasPackageJson()) {
        return res.redirect('/projects');
      }
      var infos = Pkg(req.params.name).infos();
      var projectName = req.params.name;
      var config = {};

      if (!infos.hasOwnProperty('name')) {

        return res.redirect('/projects');
      } else if (infos.name !== projectName) {

        config.configFile = JSON.stringify(infos);
        Project(projectName, io).update(config);
        projectName = infos.name;

        return res.redirect('/projects/' + projectName);
      }

      return res.render('projects/view', {
        title: 'Project ' + projectName,
        infos: infos,
        tree: Project(projectName).tree()
      });
    })
    .post(function(req, res) {
      var project = Project(req.params.name, io);
      var config = JSON.parse(req.body.configFile) || '';

      project.update(req.body);

      Pkg((config) ? config.name : req.params.name, io).install();
      Pkg((config) ? config.name : req.params.name, io).packages();

      return res.status(200).end();
    });

  router.route('/:name/delete')
    .get(function(req, res) {
      Project(req.params.name).delete();
      return res.redirect('/projects');
    });

  router.route('/:name/scripts')
    .get(function(req, res) {
      var action = req.query.action;

      if(action == "exec") {
        Proc(req.params.name, io).exec(req.query.name);
      }
      if(action == "kill") {
        Proc(req.params.name, io).kill(req.query.pid);
      }
      return res.status(200).end();
    });

  router.route('/:name/packages')
    .get(function(req, res) {
      var action = req.query.action;
      var version = req.query.version || 'latest';
      var projectName = req.params.name;

      if (action == 'delete') {
        Pkg(projectName, io).delete(req.query.name, req.query.env);
      } else if (action == 'add') {
        Pkg(projectName, io).add(req.query.name, version, req.query.env);
      } else if (action == 'install') {
        Pkg(projectName, io).install();
      }

      return res.status(200).end();
    });

  router.route('/:name/files')
    .get(function(req, res) {
      var filePath = req.query.filePath;
      var project = Project(req.params.name);
      var action = req.query.action || '';

      if (action == 'add') {
        project.file.new(filePath);

        return res.status(200).json({ tree: project.tree() }).end();
      } else if (action == 'delete') {
        project.file.delete(filePath);

        return res.status(200).json({ tree: project.tree() }).end();
      } else {
        return res.status(200)
          .json({
            fileContent: project.file.content(filePath),
            extension: project.file.extension(filePath)
          })
          .end();
      }
    })
    .post(function(req, res) {
      var filePath = req.body.filePath;
      var fileContent = req.body.fileContent;

      Project(req.params.name).file.edit(filePath, fileContent);

      return res.status(200).end();
    });

  router.route('/:name/file')
    .get(function(req, res) {
      var filePath = req.query.path;
      var project = Project(req.params.name);
      var lastIndexChar = filePath.lastIndexOf('/');
      var filename = filePath.substring(lastIndexChar + 1);

      return res.render('projects/file', {
        title: req.params.name + ' - ' + filename,
        project: req.params.name,
        fileContent: project.file.content(filePath),
        extension: project.file.extension(filePath),
        navPath: filePath
      });
    });

  router.route('/:name/folders')
    .get(function(req, res) {
      var folderPath = req.query.folderPath;
      var project = Project(req.params.name);
      var action = req.query.action || '';

      if (action == 'add') {
        project.folder.new(folderPath);

      } else if(action == 'delete') {
        project.folder.delete(folderPath);

      } else if(action == 'rename') {
        var projectPath = 'projects/' + req.params.name;
        var folderPath = projectPath + '/' + req.query.folderPath;
        var path = folderPath.slice(0, folderPath.lastIndexOf('/'));

        project.folder.rename(folderPath, path + '/' + req.query.folderName);
      }

      return res.status(200).json({ tree: project.tree() }).end();
    });

  router.route('/:name/logs')
    .get(function (req, res) {
      var projectName = req.params.name;
      var action = req.query.action || '';

      if (action == 'clean') {
        Project(projectName, io).cleanLogs();
      }

      return res.status(200).end();
    });

  return router;
}
