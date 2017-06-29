var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	if(req.session.userInfo == null)
  		res.render('index', {userInfo : req.session.userInfo});
  	else 
  		res.redirect('/main');
});

module.exports = router;
