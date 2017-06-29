var express = require('express');
var router = express.Router();
var hash = require('password-hash');
var User = require("../models/user");

/* GET users listing. */
router.get('/logout', function(req, res, next) {
	req.session.userInfo = null;
	res.redirect('/');
});

router.post('/login', function(req, res, next) {
  req.assert("email", "계정은 이메일 형식입니다.").isEmail();
  req.assert("pwd", "비밀번호는 6자리 이상 20자리 이하 입니다.").len(6, 20);
  var error = req.validationErrors();
  if(error){
  	console.log('error : ', error);
	msg = error[0].msg;
	res.send("<script> alert('"+msg+"'); history.go(-1); </script>");
  }else{
  	var email = req.body.email;
  	var pass = req.body.pwd;
  	var query = User.find({"user_id" : email});
  	query.then(
  		function(doc){
  			// This doc is List, Element is Object Structure
			if(doc.length > 0){
				var rs = doc[0];
                if(hash.verify(pass, rs['user_pwd'])){
					req.session.userInfo = {
						mem_name	: rs['user_name'],
						mem_id		: rs['user_id']
					};
					res.redirect('/main');
				}else{
					msg = "비밀번호가 일치하지 않습니다.";
				res.send("<script> alert('"+msg+"'); history.go(-1); </script>");
				}
			}else{
                msg = "비밀번호가 일치하지 않습니다.";
                res.send("<script> alert('"+msg+"'); history.go(-1); </script>");
			}
		},
		function(err){
			console.log("SELECT Query Error : ", err);
		}
	);
  	// req.getConnection(function(err, conn){
  	// 	var query = "SELECT * FROM MEMBER WHERE mem_id = ?";
  	// 	conn.query(query, [email], function(queryErr, result, fields){
  	// 		if(queryErr){
  	// 			console.log("SELECT Query Error : ", queryErr);
  	// 		}else{
  	// 			if(result.length > 0){
	  // 				var rs = result[0];
	  // 				if(hash.verify(pass, rs['mem_pwd'])){
	  // 					req.session.userInfo = {
	  // 						mem_name	: rs['mem_name'],
	  // 						mem_id		: rs['mem_id'],
       //
	  // 					};
	  // 					res.redirect('/main');
	  // 				}else{
	  // 					msg = "비밀번호가 일치하지 않습니다.";
		// 				res.send("<script> alert('"+msg+"'); history.go(-1); </script>");
	  // 				}
  	// 			}else{
  	// 				msg = "가입되지 않은 계정입니다.";
		// 			res.send("<script> alert('"+msg+"'); history.go(-1); </script>");
  	// 			}
  	// 		}
  	// 	});
  	// });
  }
});


module.exports = router;
