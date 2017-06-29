var express = require('express');
var hash = require('password-hash');
var router = express.Router();
var User = require("../models/user");

/* GET users listing. */
router.get('/first', function(req, res, next) {
  res.render('register/inputEmail', { userInfo : req.session.userInfo });

});

router.post('/second', function(req, res, next) {
	var email = req.body.email;
	var msg;
	console.log("second");
	if(email == "" || email == null){
		msg = "이메일을 입력하세요";
		res.send("<script> alert('"+msg+"'); history.go(-1); </script>");
	}else{
		var query = User.find({"user_id" : email});
		query.then( function(doc){
				if(doc.length > 0){
                    msg = "이미 가입하신 이메일입니다.";
                    res.send("<script> alert('"+msg+"'); history.go(-1); </script>");
				}else{
                    res.render('register/inputPage', { id: email, userInfo : req.session.userInfo });
				}
			},
			function(err){
				console.log("err : ", err);
			}
		);

		/*************** This is Pre Version Code **********************/
		// req.getConnection(function(err, conn){
		// 	var query = "SELECT COUNT(*) AS cnt FROM MEMBER WHERE mem_id = ?";
		//
		// 	conn.query(query, [email], function(error, results, field){
		// 		if(error){
		// 			console.log("DB SELECT Error : ", error);
		// 			// conn.release();
		// 		}else{
		// 			if(results[0]['cnt'] == 0)
		// 				res.render('register/inputPage', { id: email, userInfo : req.session.userInfo });
		// 			else{
		// 				msg = "이미 가입하신 이메일입니다.";
		// 				res.send("<script> alert('"+msg+"'); history.go(-1); </script>");
		// 			}
		// 			// conn.release();
		// 		}
		// 	});
		// });
	}
});

router.post('/complete', function(req, res, next){
	
	req.assert('email', '이메일을 입력하세요.').notEmpty();
	req.assert('email', '이메일을 확인하세요').isEmail();
	req.assert('name', '이름을 입력하세요').notEmpty();
	req.assert('pass1', '비밀번호는 최소 6자리 최대 20자리 이내입니다.').len(6,20);
	req.assert('pass2', '비밀번호를 확인해 주세요').len(6,20);

	var error = req.validationErrors();
	if(error){
		console.log('error : ', error);
		msg = error[0].msg;
		res.send("<script> alert('"+msg+"'); history.go(-1); </script>");
	}else{
		var email = req.body.email;
		var name = req.body.name;
		var pass1 = req.body.pass1;
		var pass2 = req.body.pass2;

		if( pass1 == pass2)	{
            pwdHash = hash.generate(pass1);
			var insertData = new User({
				"user_id" : email,
				"user_pwd" : pwdHash,
				"user_name" : name,
				"user_devices" : []
			});
			var insertRes = insertData.save();
			insertRes.then(
				function(success){
					console.log("Success : ", success);
                    res.redirect('/');
				},
				function(err){
                    console.log("Connection Error : ", err);
				}
			);

			// req.getConnection(function(err, conn){
			// 	if(err){
			// 		console.log("Connection Error : ", err);
			// 	}else{
			// 		var query = "INSERT INTO MEMBER( mem_id, mem_pwd, mem_name ) values(?, ?, ?)";
			// 		pwdHash = hash.generate(pass1);
			// 		conn.query(query, [email, pwdHash, name], function(error){
			// 			if(error){
			// 				console.log("INSERT Query Error : ", error);
			// 			}else{
			// 				res.redirect('/');
			// 			}
			// 		})
			// 	}
			// });

		}else{
			msg = "비밀번호가 일치하지 않습니다.";
			res.send("<script> alert('"+msg+"'); history.go(-1); </script>");	
		}
	}
	
});

module.exports = router;
