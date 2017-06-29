/*
  2017. 06. 28. Added By Kwon Tae Seong
  This is Web Server, Socket.io(WebSocket) and TCP Server

 */
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');
/****** User Add Route ******/
var register = require('./routes/register');
var auth = require('./routes/auth');
var mainRoute = require('./routes/main');
var device = require('./routes/device');

/****************************/
/****** User Add Moudule ******/
var io = require("socket.io")();
var net = require("net");
var session = require("express-session")({
    secret: "ansytorage_renewal",
    resave: true,
    saveUninitialized: true
});
var sharedsession = require("express-socket.io-session");
var validator = require('express-validator');
var mongoose = require("mongoose");
var hash = require('password-hash');

mongoose.connect('mongodb://localhost/anystorage_db');
mongoose.connection.once("open", function(){
    console.log("Connected to mongod server");
});
mongoose.connection.on("error", console.error);
/*******************************/

var app = express();
// Add io
app.io = io;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session);       // Add express-session

app.use('/', index);
app.use('/users', users);

app.use(validator());
/******* User URL Pattern *********/
app.use('/register', register);
app.use('/auth', auth);
app.use('/main', mainRoute);
app.use('/device', device);
/**********************************/

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
/********************* User Defined Data Structure ***********************/
function Member(){
  var webUsers = [];
  var devices = new Map();
  this.getUsers = function(){
    return webUsers;
  };
  this.getDevices = function(){

  };
  this.removeDevice = function(key){
    return devices.delete(key);
  }

}
function ResponseData(t, c, m){
  this.__constructor(t, c,m);
}
ResponseData.prototype.type;
ResponseData.prototype.code;
ResponseData.prototype.statusText;
ResponseData.prototype.data;
ResponseData.prototype.setData = function(data){
  this.data = data;
};
ResponseData.prototype.__constructor = function(type, code, msg){
  this.type = type;
  this.code = code;
  this.statusText = msg;
};

C_CONNECT = "connection";
DATA = "data";
REQUEST = "request";
RESPONSE = "response";

TYPE_DEVICE_LIST = "device_list";
var userTable = new Map();

/********************* Socket.io Server Code *************************/
var User = require("./models/user");

console.log("===== WebSocket Server Start =====");
io.use(sharedsession(session));
io.on(C_CONNECT, function(client){
  console.log("=> Client Connect!");
  initClient(client);
});

function initClient(client){
  console.log("==> Initialize Client Event!");
  console.log(client.handshake.session.userInfo);
  client.emit("packet", {userData : client.handshake.session.userInfo});
  client.on(DATA, function(data){
      // if("data")
  });
  client.on(REQUEST, function(data){
    if(data["type"] == TYPE_DEVICE_LIST){
      console.log("device_list");
    }
  });
}
/******************** TCP Server Section *********************/
LOGIN = "login";

console.log("===== TCP Server Start =====");
var myServer = net.createServer();      // 소켓서버 생성
myServer.listen(9900);        // PORT 9900으로 바인딩

// 연결 요청 허용 메소드
myServer.on("connection", function(socket){
  console.log("Connect! Client(Android)");

  // 메시지 데이터 핸들링
  socket.on("data", function(recv_buf){
    var data = JSON.parse(recv_buf.toString());
    if(data["type"] == LOGIN){
      console.log("===> Recv : "+LOGIN);
      var email = data["user_id"];
      var pwd = data["user_pwd"];
      tcpLogin(data, socket);
    }
  });

});

// 로그인 함수 구현
function tcpLogin(data, socket){
    var email = data["user_id"];
    var pwd = data["user_pwd"];
    // var deviceModel = data["device_model"];
    var deviceSerial = data["device_serial"];

    var query = User.find({"user_id" : email});
    query.then(
        function(result){
          var rs = result[0];
          var buff = null;
          if(hash.verify(pwd, rs["user_pwd"])){
              var resData = new ResponseData("response:login", 200, "Success Login!");
              resData.setData(null);
              console.log(JSON.stringify(resData));
              buff = new Buffer(JSON.stringify(resData), "UTF-8");
              var member = userTable.get(email);

          }else{
              var resData = new ResponseData("response:login", 400, "Incorrect! User Email or Password!");
              resData.setData(null);
              console.log(JSON.stringify(resData));
              buff = new Buffer(JSON.stringify(resData), "UTF-8");
          }

          socket.write(buff);
        },
        function(err){
          console.log("login error", err);
        }
    );
}
module.exports = app;
