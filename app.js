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
var io2 = require("socket.io")();
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
  var webUser = null;
  var devices = new Map();

  this.getUser = function(){
    return webUser;
  };
  this.setUser = function(s){
      webUser = s;
  };
  this.addDevice = function(key, socket){
    devices.set(key, socket);
  };
  this.getDevices = function(){
    return devices;
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


/***** Temp Data Structure *****/
// function Packet(){}
// Packet.prototype._size;
// Packet.prototype._buffer;
// Packet.prototype.init = function(){
//     this._buffer = null;
// };
// Packet.prototype.setSize = function(size){
//     this._size = size;
//     this._buffer = null;
// };
// Packet.prototype.concatBuffer = function(buff){
//     if(this._buffer == null){
//         this._buffer = new Buffer(buff);
//     }else{
//         buff = Buffer.from(buff);
//         var totalLen = this._buffer.length + buff.length;
//         this._buffer = Buffer.concat([this._buffer, buff], totalLen);
//     }
// };
// Packet.prototype.getSize = function(){ return this._buffer.length; };
// Packet.prototype.getTotalSize = function () { return this._size; };
// Packet.prototype.getBuffer = function() { return this._buffer; };


C_CONNECT = "connection";
DATA = "data";
REQUEST = "request";
RESPONSE = "response";
ONLINE = "online";
OFFLINE = "offline";

TYPE_DEVICE_LIST = "device_list";
var userTable = new Map();

/********************* Socket.io Server Code *************************/
var User = require("./models/user");
var wNum = 0;
console.log("===== WebSocket Server Start =====");
io.use(sharedsession(session));

// Web Browser Connect!
io.on(C_CONNECT, function(client){
  console.log("=> Client Connect!");
  initClient(client);     // Initialize Client Event
});

function initClient(client){
    console.log("==> Initialize Client Event!");
    if(!client.handshake.session.userInfo) {
        return;
    }
    var userKey = client.handshake.session.userInfo.mem_id;
  //  client.set("user_num", "wClient_"+wNum);
  //  wNum++;

    var member = null;
    console.log("user key", userKey);
    if(userTable.has(userKey)){
        console.log("EXIST WSOCKET USER");
        member = userTable.get(userKey)
        var tmp = member.getUser();
        member.setUser(client);
    }else{
        console.log("NOT WSOCKET USER");
        member = new Member();
        member.setUser(client);
        userTable.set(userKey, member);
    }


    client.on(DATA, function(data){
        console.log("PACKET : ", data);

        var deviceSerial = data["device"];
        // 세션에 있는 사용자 아이디를 가져온다
        var clientKey = client.handshake.session.userInfo.mem_id;

        // 세션이 남아 있는가 체크
        if(clientKey){
            var member = userTable.get(clientKey);
            if(member){
                var devices = member.getDevices();
                if(devices.has(deviceSerial)){      // 현재 사용자의 기기가 존재하는가???
                    var device = devices.get(deviceSerial);         // 디바이스 가져오기
                    var dSocket = device["socket"];                 // 디바이스가 연결된 소켓을 가져온다
                    var reqData = data["data"];
                    dSocket.write(JSON.stringify(reqData));         // 데이터를 받는다.

                    /*

                        {
                            "device" : "adsfasdfew324"
                            "data" : {
                                "type"      :       "filetree"
                            }
                        }
                     */
                }else{                               // 사용자의 기기가 존재 하지 않을경우
                    // 디바이스가 없다라는 메시지를 보낸다.
                }
            }
        }else{
            // 세션이 만료되어 메인페이지로 돌아가는 메시지를 보낸다
        }
    });
    client.on(REQUEST, function(data){
      if(data["type"] === TYPE_DEVICE_LIST){
        console.log("device_list");
        notifyOnlineDevices(userKey);
      }
    });
    client.emit("ready", {userData : client.handshake.session.userInfo});
}
/******************** TCP Server Section *********************/
LOGIN = "login";
LOGOUT = "logout";
CHUNK_SIZE = 1024;
TOKEN = "\n\r";

console.log("===== TCP Server Start =====");
var myServer = net.createServer();      // 소켓서버 생성
myServer.listen(9900);        // PORT 9900으로 바인딩

// 연결 요청 허용 메소드
myServer.on("connection", function(socket){
  console.log("=> Connect! Client(Android)");
  socket.myBuffer = null;
  socket.setKeepAlive(true);
  socket.setTimeout(3600000*24);

  // 메시지 데이터 핸들링
  socket.on("data", function(recv_buf){
     console.log("recv data : ", recv_buf.toString());

      if(socket.myBuffer === null){
            console.log("===> Buffer null");
          socket.myBuffer = recv_buf.toString();
            // socket.myBuffer = recv_buf;
      }else{
          console.log("===> chunk Data");
          socket.myBuffer += recv_buf.toString();
          // var totalLen = socket.myBuffer.length + recv_buf.length;
          // socket.myBuffer = Buffer.concat([socket.myBuffer, recv_buf], totalLen);
      }

      if(socket.myBuffer.indexOf(TOKEN) !== -1){
          var tmp = socket.myBuffer.split(TOKEN);
          socket.myBuffer = "";
          for(var idx = 1; idx<tmp.length; idx++) {
              socket.myBuffer += tmp[idx];
          }
          try{
              console.log("====> recv data parse json start");
              var data = JSON.parse(tmp[0]);
              console.log("====> recv data parse json edn");
              socket.myBuffer = null;
              if(data["type"] === LOGIN){
                  console.log("===> Recv : "+LOGIN);
                  tcpLogin(data, socket);   // Call android login
              }else if(data["type"] === LOGOUT){

              }else if(data["type"] === DATA){
                  console.log("===> Recv"+DATA, typeof data["data"]);
                  var packet = data["data"];
                  sendData(packet, socket);
              }
          }catch(e){

          }
      }

      // try{
      //     console.log("====> recv data parse json start");
      //     var data = JSON.parse(socket.myBuffer.toString());
      //     console.log("====> recv data parse json edn");
      //     socket.myBuffer = null;
      //     if(data["type"] === LOGIN){
      //         console.log("===> Recv : "+LOGIN);
      //         tcpLogin(data, socket);   // Call android login
      //     }else if(data["type"] === LOGOUT){
      //
      //     }else if(data["type"] === DATA){
      //         console.log("===> Recv"+DATA, typeof data["data"]);
      //         var packet = data["data"];
      //         sendData(packet, socket);
      //     }
      // }catch(e){
      //
      // }

  });
  socket.on("end", function(){
      console.log("====> Recv End ");

  });
  socket.on("timeout", function(){
      console.log("=====>TCP Cient Time Out");
  });
  socket.on("close", function(){
      console.log("TCP Socket Close");
      if(socket.mySerial){
        // var member = userTable.get(socket.myUserKey);
        // member.removeDevice(socket.mySerial);
        // console.log("delete online list");
      }
  });
});
// 데이터 전송 구현
function sendData(packet, socket){
    var key = socket.myUserKey;
    var member = null;
    console.log("====> send data load...");
    if(userTable.has(key)){
        console.log("====> send data ready...");
        member = userTable.get(key);
        var wSocket = member.getUser();
        if(wSocket){
            console.log("====> send data transmit...");
            wSocket.emit(DATA, packet);
            var ack = { "type" : "ack", "data" : true};
            var ackBuff = new Buffer(JSON.stringify(ack), "UTF-8");
            socket.write(ackBuff);
            console.log("====> send data end...");
        }else{
            console.log("===> send data transmot fail.... not found wSocket");
        }
    }else{
        console.log("====> send data load fail.... not exist user Table value");
    }
}
// 로그인 함수 구현
function tcpLogin(data, socket){
    var email = data["user_id"];
    var pwd = data["user_pwd"];

    var deviceModel = data["device_model"];
    var deviceSerial = data["device_serial"];
    var deviceName = data["device_name"];

    // Mongo db Model Query
    var query = User.find({"user_id" : email});

    // Query Result
    query.then(
        function(result){
          var buff = null;

          // 존재하지 않는 계정인가?
          if(result.length === 0){
              var resData = new ResponseData("response:login", 400, "Incorrect! User Email or Password!");
              resData.setData(null);
              console.log(JSON.stringify(resData));
              buff = new Buffer(JSON.stringify(resData), "UTF-8");
          }else {
              var rs = result[0];

              // Check User Account Password
              if (hash.verify(pwd, rs["user_pwd"])) {
                  socket.mySerial = deviceSerial;
                  socket.myUserKey = email;
                  // Set Response Data
                  var resData = new ResponseData("response:login", 200, "Success Login!");
                  resData.setData(null);
                  console.log(JSON.stringify(resData));
                  buff = new Buffer(JSON.stringify(resData), "UTF-8");

                  // Set TCP Client to the User Table of Server
                  var member;
                  // if User table has email then
                  console.log("email : ", email);
                  if(userTable.has(email)) {
                      // 현재 UserTable에 해당계정이 등록되어있다면
                      // UserTable에 Client를 추가한다
                      console.log("Has User Table");
                      member = userTable.get(email);
                      member.addDevice(deviceSerial,
                      {   "socket" : socket,
                          "info" : {
                              "device_name"     :   deviceName,
                              "device_model"    :   deviceModel,
                              "device_serial"   :   deviceSerial
                          }
                      });
                  }else{
                      // 현재 UserTable에 해당계정이 등록되어 있지 않다면
                      // UserTable에 member를 생성하고 UserTable에 등록한다
                      console.log("Not Has User Table");
                      member = new Member();
                      member.addDevice(deviceSerial,
                          {   "socket" : socket,
                              "info" : {
                                  "device_name"     :   deviceName,
                                  "device_model"    :   deviceModel,
                                  "device_serial"   :   deviceSerial
                              }
                          });

                      userTable.set(email, member);
                  }

                  // DB로부터 계정정보를 가져온다
                  var select = User.findOne({"user_id": email});

                  // 조회 결과문
                  select.then(
                      function (doc) {
                          var flag = false;
                          console.log(doc["user_devices"]);
                          var dList = doc["user_devices"];
                          var obj = null;

                          // 현재 접속한 디바이스가 내계정에 등록되었는지 확인
                          for(var idx = 0; idx < dList.length; idx++){
                              var row = dList[idx];
                              if(row["device_serial"] === deviceSerial &&
                                  row["device_name"] === deviceName &&
                                  row["device_model"] === deviceModel){
                                      flag = true;
                                      obj = row;
                                      break;
                              }
                          }

                          // 등록한 적이 없다면 추가하고 끝낸다.
                          if(!flag){
                              obj = {
                                  "device_name"     :   deviceName,
                                  "device_model"    :   deviceModel,
                                  "device_serial"   :   deviceSerial
                              };
                              // UPDATE Document
                              doc["user_devices"].push(obj);
                              doc.save();
                          }

                      },
                      function (err) {}
                  );

              } else {
                  // 비밀번호가 틀렸을 경우
                  var resData = new ResponseData("response:login", 400, "Incorrect! User Email or Password!");
                  resData.setData(null);
                  console.log(JSON.stringify(resData));
                  buff = new Buffer(JSON.stringify(resData), "UTF-8");
              }
          }

          // 응답값 송신
          socket.write(buff);

        },
        function(err){
          console.log("login error", err);
        }
    );
}


// 웹브라우저에게 현재 Online중인 디바이스들을 알려준다.
function notifyOnlineDevices(email){
    var member = userTable.get(email);
    if(member){
        var wBrowser = member.getUser();
        if(wBrowser){
            console.log("wBrower is Exist");
            var dList = member.getDevices();
            var dataList = [];
            console.log("myDeivce  : ");

            var itr = dList.values();

            while((val = itr.next().value)){
                // var val = itr.value;
               // console.log("test", val);
                var wSocket = val["socket"];
                var deviceInfo = val["info"];
                dataList.push(deviceInfo);
            }
            console.log("dList : ", dataList);
            wBrowser.emit("response", { type : TYPE_DEVICE_LIST, device : dataList });

        }
    }
}


/* ==================== TEST SERVER ============================ */
REQ_DTP = "request:new_dtp";
RES_DTP = "response:new_dtp";
BIN_DATA = "bin";

SUCCESS = 200;
function DTP(){
    var wSocket = null;
    var tcpSocket = null;
    this.getWebSocket = function(){ return wSocket; };
    this.getTCPSocket = function(){ return tcpSocket; };
    this.setWebSocket = function(ws){ wSocket = ws; };
    this.setTCPSocket = function(tcp){ tcpSocket = tcp; };
}

io2.listen(2010);
io2.dtpSet = new Map();
io2.on("connection", function(wClient){
   console.log("============================== DTP CONNECT! =======================");
   var size = 0;

    wClient.on(REQ_DTP, function(data){
       var roomKey = data["key"];
       var element = new DTP();

       wClient["myKey"] = roomKey;
       element.setWebSocket(wClient);
       io2.dtpSet.set(roomKey, element);

       wClient.emit(RES_DTP, {"code" : SUCCESS } );
    });

    wClient.on(BIN_DATA, function(packet){
        var element = io2.dtpSet.get(wClient["myKey"]);
        size += packet.length;
        console.log("RECV BINARY DATA : ", size+" Byte");
        if(element !== null || element !== undefined) {
            var tcp = element.getTCPSocket();
            tcp.write(packet);
            // ws.emit("bin", packet);
        }
    });

    wClient.on("disconnect", function(){
        console.log("DTP WEBSOCKET DISCONNECT : ", wClient["myKey"]);

        if(wClient["myKey"] !== null || wClient["myKey"] !== undefined){
            var element = io2.dtpSet.get(wClient["myKey"]);
            element.setWebSocket(null);
           closed(wClient);
        }
    });

});

var dtpServer = net.createServer();
dtpServer.listen(2011);
dtpServer.on("connection", function(client){
    client.setNoDelay(false);
    client.on("data", function(packet){

        try {
            var data = JSON.parse(packet.toString());
            console.log("====>> RECV DTP JSON MSG : ", data);
            if(data["type"] === REQ_DTP){
                var roomKey = data["key"];
                var element = io2.dtpSet.get(roomKey);

                var resData = {};
                resData["type"] = RES_DTP;
                client["myKey"] = roomKey;

                if(element !== null || element !== undefined) {
                    element.setTCPSocket(client);
                    resData["code"] = 200;
                }else{
                    resData["code"] = 400;
                }
                var buff = new Buffer(JSON.stringify(resData),"UTF-8");
                client.write(buff);
            }else{
                var element = io2.dtpSet.get(client["myKey"]);
                if(element !== null || element !== undefined) {
                    var ws = element.getWebSocket();
                    ws.emit("msg", data);
                }
            }
        }catch(e){
            console.log("RECV BINARY DATA : ", packet);
            var element = io2.dtpSet.get(client["myKey"]);
            if(element !== null || element !== undefined) {
                var ws = element.getWebSocket();
                ws.emit("bin", packet);
            }
        }
    });

    client.on("end", function(){
        console.log("====>> DTP TCP DISCONNECT : ", client["myKey"]);
        if(client["myKey"] !== null || client["myKey"] !== undefined){
            var element = io2.dtpSet.get(client["myKey"]);
            element.setTCPSocket(null);
            closed(client);
        }
    });
});
function closed(client){
    var element = io2.dtpSet.get(client["myKey"]);
    if(element !== null || element !== undefined) {
        var ws = element.getWebSocket();
        var tcp = element.getTCPSocket();

        if ((ws === null || ws === undefined) &&
            (tcp === null || tcp === undefined)) {
            io2.dtpSet.delete(client.myKey);
        }
        client["myKey"] = null;
    }
}
module.exports = app;
