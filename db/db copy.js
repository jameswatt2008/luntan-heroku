const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// useNewUrlParser: true, useUnifiedTopology: true 
let url = 'mongodb+srv://test:123@cluster0.jr9zq.mongodb.net/luntan?retryWrites=true&w=majority'
mongoose.connect(url, { config: { autoIndex: false }, useNewUrlParser: true });//127.0.0.1:27017/dumall
// mongoose.connect('mongodb://localhost/bsdb', { config: { autoIndex: false },useNewUrlParser:true });//127.0.0.1:27017/dumall


// 为这次连接绑定事件
const db = mongoose.connection;
db.once('error', () => console.log('Mongo 连接失败'));
db.once('open', () => console.log('Mongo 连接成功'));



//用户表
const UserSchema = new Schema({
    User_id: String,
    Psw: String,
    User_name: String,
    Nick_name: String,
    Email: String,
    User_sex: String,
    User_intro: { type: String, default: "楼主很懒！什么也没留下" },
    Like: Number,
    User_tx: String,
    Flow: [{ type: String }],
    Friend: [{ type: String }],
    User_dz: [{ type: String }],
    User_look: [{ type: String }]
}, {
    versionKey: false,//去掉版本锁 __v0
});

//帖子表
const TzSchema = new Schema({
    User_id: String,
    User_name: String,
    User_tx: String,
    Pl: Number,
    Tz_time: String,
    Tz_text: String,
    Tz_type: String,
    Tz_img: [{
        type: String
    }],
    Tz_like: Number,
    Tz_likeuser: [{ type: String }],
    Tz_unlikeuser: [{ type: String }],
    Tz_ok: String,
    Tz_show: Boolean,
}, {
    versionKey: false//去掉版本锁 __v0
});

//评论表
const PlSchema = new Schema({
    // Tz_id:{
    //     type:mongoose.Schema.ObjectId,ref="Tz"
    // },
    Tz_id: String,
    Pl_userid: String,
    Pl_username: String,
    Pl_touser: String,
    Pl_tx: String,
    Pl_time: String,
    Pl_text: String,
    Pl_img: [{
        type: String
    }],
    Pl_like: Number,
    Pl_likeuser: [{ type: String }],
    Pl_unlikeuser: [{ type: String }],
}, {
    versionKey: false//去掉版本锁 __v0
});

//树洞表
const SdSchema = new Schema({
    User_id: String,
    Nick_name: String,
    Pl: Number,
    Pl_msg: [{
        Pl_id: String,
        Pl_nick: String,
        Pl_text: String,
        Pl_time: String,
    }],
    Sd_time: String,
    Sd_text: String,
    Sd_like: Number,
    Sd_likeuser: [{ type: String }],
}, {
    versionKey: false//去掉版本锁 __v0
});
//消息表
//聊天表
const ChatSchema = new Schema({
    from: String,
    fname: String,
    ftx: String,
    to: String,
    tname: String,
    ttx: String,
    body: [{
        text: String,
        img: String,
        status: Number,
        time: { type: Date, default: Date.now() },
        ttime: String,
        sender: String
    }],
    content: { type: String, default: '0' },
    meta: {
        updateAt: { type: Date, default: Date.now() },
        createAt: { type: Date, default: Date.now() }
    }
}, {
    versionKey: false//去掉版本锁 __v0
});


const Models = {
    User: mongoose.model('User', UserSchema),
    Chat: mongoose.model("Chat", ChatSchema),
    Tz: mongoose.model("Tz", TzSchema),
    Pl: mongoose.model("Pl", PlSchema),
    Sd: mongoose.model("Sd", SdSchema),
}

module.exports = Models;

