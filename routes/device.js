var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
	if(req.session.userInfo){
		var device = req.query.name;
		console.log(req.query.name);
		res.render('device', {userInfo : req.session.userInfo, device_model : device, server_addr : req.host});
	}else 
		res.redirect("/");
});

module.exports = router;
 