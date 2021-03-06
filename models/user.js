/**
 * Created by TaeSeongKwon on 2017. 6. 29..
 */
var mongoose = require("mongoose");
mongoose.Promise = global.Promise;

var Schema = mongoose.Schema;

var userSchema = new Schema({
    "user_id"   :   String,
    "user_pwd"  :   String,
    "user_name" :   String,
    "user_devices" : [{
       "device_name"    : String,
        "device_model"  : String,
        "device_serial" : String
    }]
}, {"collection" : "user"});

module.exports = mongoose.model("user", userSchema);