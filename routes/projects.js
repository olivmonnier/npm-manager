var express = require('express');
var router = express.Router();

// Services
var Pkg = require('../services/pkg');
var Project = require('../services/project');

router.route('/')
  .get(function(req, res) {
    return res.render('projects', {
      title: 'Projects',
      projects: Project.list()
    });
  });

router.route('/new')
  .get(function(req, res) {
    return res.render('new', {
      title: 'New Project'
    });
  })
  .post(function(req, res) {
    Project.create(req.body);
    if (req.body.pkgDev) {
      Pkg.add(req.body.pkgDev, 'projects/' + req.body.name, true);
    }
    if (req.body.pkgProd) {
      Pkg.add(req.body.pkgProd, 'projects/' + req.body.name, false);
    }
    return res.redirect('/projects');
  });

router.route('/:name')
  .get(function(req, res) {
    return res.render('infos', {
      title: 'Project ' + req.params.name,
      infos: Pkg.infos('projects/' + req.params.name)
    });
  })
  .post(function(req, res) {
    Project.update(req.body);
    Pkg.install('projects/' + req.body.name);
    if (req.body.pkgDev) {
      Pkg.add(req.body.pkgDev, 'projects/' + req.body.name, true);
    }
    if (req.body.pkgProd) {
      Pkg.add(req.body.pkgProd, 'projects/' + req.body.name, false);
    }
    return res.render('infos', {
      title: 'Project ' + req.body.name,
      infos: Pkg.infos('projects/' + req.body.name)
    });
  });

router.route('/:name/delete')
  .post(function(req, res) {
    Project.delete(req.params.name);
    return res.redirect('/projects');
  });

router.route('/:name/scripts')
  .get(function(req, res) {
    var task = Pkg.exec(req.query.name, 'projects/' + req.params.name);
    res.send(task)
  });

router.route('/:name/packages/:pkgName/delete')
  .post(function(req, res) {
    Pkg.uninstall(req.params.pkgName, 'projects/' + req.body.name, (req.body.env == "true") ? true : false);
    return res.render('infos', {
      title: 'Project ' + req.body.name,
      infos: Pkg.infos('projects/' + req.body.name)
    });
  });

module.exports = router;
