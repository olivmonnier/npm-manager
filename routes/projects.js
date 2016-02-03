var express = require('express');
var router = express.Router();

// Services
var Pkg = require('../services/pkg');
var Project = require('../services/project');

module.exports = function(io) {
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
        Pkg(req.body.name, io).add(req.body.pkgDev, true);
      }
      if (req.body.pkgProd) {
        Pkg(req.body.name, io).add(req.body.pkgProd, false);
      }
      return res.redirect('/projects');
    });

  router.route('/:name')
    .get(function(req, res) {
      return res.render('infos', {
        title: 'Project ' + req.params.name,
        infos: Pkg(req.params.name, io).infos()
      });
    })
    .post(function(req, res) {
      Project.update(req.body);
      Pkg(req.body.name, io).install();

      return res.render('infos', {
        title: 'Project ' + req.body.name,
        infos: Pkg(req.body.name, io).infos()
      });
    });

  router.route('/:name/delete')
    .post(function(req, res) {
      Project.delete(req.params.name);
      return res.redirect('/projects');
    });

  router.route('/:name/scripts')
    .get(function(req, res) {
      var action = req.query.action;

      if(action == "exec") {
        Pkg(req.params.name, io).exec(req.query.name);
      }
      if(action == "kill") {
        Pkg(req.params.name, io).kill(req.query.pid);
      }
      return res.status(200).end();
    });

  router.route('/:name/packages')
    .get(function(req, res) {
      var action = req.query.action;

      if(action == 'delete') {
        Pkg(req.params.name, io).uninstall(req.query.name, req.query.env);
      }
      if (action == 'add') {
        Pkg(req.params.name, io).add(req.query.name, req.query.env);
      }
      return res.status(200).end();
    });
  return router;
}
