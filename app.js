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

/****** User Add Moudule ******/
var io = require("socket.io")();
var net = require("net");
var session = require("express-session")({
    secret: "ansytorage_renewal",
    resave: true,
    saveUninitialized: true
});
var sharedsession = require("express-socket.io-session");
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
/********************* Socket.io Server Code *************************/
C_CONNECT = "connection";
DATA = "data";

console.log("===== WebSocket Server Start =====");
io.use(sharedsession(session));
io.on(C_CONNECT, function(client){
  console.log("=> Client Connect!");
  initClient(client);
});

function initClient(client){
  console.log("==> Initialize Client Event!");
  console.log(client.handshake.session.userId);
  client.emit("data", {userId : client.handshake.session.userId});
  client.on(DATA, function(data){

  });

}

module.exports = app;
