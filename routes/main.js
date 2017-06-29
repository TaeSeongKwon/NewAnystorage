var express = require('express');
var router = express.Router();
var User = require("../models/user");

/* GET users listing. */
router.get('/', function(req, res, next) {
	if(req.session.userInfo){
		var mem_id = req.session.userInfo.mem_id;
		console.log("host ip : ", req.host);
		var query = User.find({"user_id" : mem_id});
		var devices = ["hello", "test"];
		query.then(
			function(result){
				devices = result[0]["user_devices"];
				console.log("test1 : ", devices);
                res.render('main', {userInfo : req.session.userInfo, deviceList : JSON.stringify(devices) });
			},
			function(err){
                console.log("SELECT Query Error : ", err);
			}
		);
	}else
		res.redirect('/');
});

module.exports = router;
