var express = require('express');
var router = express.Router();
const { users } = require('../services/mqttClientUser');
const { pools } = require('../services/mqttClient');

// GET Home page
router.get('/', function(req, res, next) {
  res.render('index', {page:'Dashboard', menuId:'dashboard'});
});

// GET Info page
router.get('/info', function(req, res, next) {
  res.render('info', {page:'Info', menuId:'info'});
});

router.get('/users', (req, res) => {
  res.json(users);
});

router.get('/pools', (req, res) => {
  res.json(pools);
});

module.exports = router;