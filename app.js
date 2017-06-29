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
C_CONNECT = "connection";
DATA = "data";
REQUEST = "request";
RESPONSE = "response";

TYPE_DEVICE_LIST = "device_list";
/********************* Socket.io Server Code *************************/


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
console.log("===== TCP Server Start =====")
var myServer = net.createServer();
myServer.listen(9900);
myServer.on("connection", function(socket){
  console.log("Connect! Client(Android)");
  socket.on("data", function(recv_buf){
    var data = recv_buf.toString();

  });

});

module.exports = app;
