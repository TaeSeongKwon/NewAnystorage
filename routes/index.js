var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if(!req.session.userId ) req.session.userId = "Test";

  res.render('index', { title: req.session.userId });
});

module.exports = router;
