const express = require('express');
const router = express.Router();

//图片上传改名
var multer = require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // 接收到文件后输出的保存路径（若不存在则需要创建）
        cb(null, './public/upload/');
    },
    filename: function (req, file, cb) {
        // 将保存文件名设置为 时间戳 + 文件原始名，比如 151342376785-123.jpg
        cb(null, Date.now() + "-" + file.originalname);
    }
});
var upload = multer({ storage: storage });


//引入db
let db = require('../db/db');
let Chat = db.Chat;//表
let User = db.User;

/************** 创建(create) 读取(get) 更新(update) 删除(delete) **************/

//图片上传
router.post('/upload', upload.any('logo'), function (req, res, next) {
    let files = req.files;
    let result = [];
    for (let i = 0; i < files.length; i++) {
        result.push('/upload/' + files[i].filename);
    }
    res.send({ result });//图片上传成功回调本地地址
});

router.post('/addchat', function (req, res, next) {    //插入聊天记录
    let from = req.body.from;
    let fname = req.body.fname;
    let ftx = req.body.ftx;
    let to = req.body.to;
    let tname = req.body.tname;
    let ttx = req.body.ttx
    let body = {
        text: req.body.text,
        status: req.body.status,
        img: req.body.img,
        sender: req.body.from,
        ttime: req.body.ttime,
    };
    let json1 = { from, fname, ftx, to, tname, ttx, body };
    let chat = new Chat(json1);
    Chat.findOne({ $or: [{ from: from, to: to }, { from: to, to: from }] }, function (err, doc) {
        if (doc) {
            let resultFrom = doc.from;
            let resultTo = doc.to;
            Chat.updateOne({ from: resultFrom, to: resultTo }, { $push: { body: body } }, function (err) {
                console.log('插入一条聊天记录');
                let msg = {};
                if (err) {
                    msg['status'] = 'error';
                    throw err;
                }
                msg['status'] = 'ok';
                res.send({ msg });
            })
        }
        else {
            chat.save((err, chat) => {
                let msg = {};
                if (err) {
                    msg['status'] = 'error';
                    throw err;
                }
                msg['status'] = 'ok';
                res.send({ msg });
            });
        }
    });
});


router.get('/getchatlist/:id', (req, res) => {//聊天列表
    var U = req.params.id;
    Chat.find({ $or: [{ from: U }, { to: U }] }, function (err, list) {
        let msg = {};
        if (err) {
            msg['status'] = 'error';
            throw err;
        }
        msg['status'] = 'ok';
        msg['list'] = list;
        res.send({ msg });
        console.log('聊天列表:' + list);
    });
});



router.get('/getchat/:to/:from', (req, res) => {//取聊天记录
    var toer = req.params.to;
    var fromer = req.params.from;
    console.log('toer', toer);
    console.log('fromer', fromer);
    Chat.find({ $or: [{ from: fromer, to: toer }, { from: toer, to: fromer }] }).exec(function (err, a) {
        if (a.length > 0) {
            Chat.find({ $or: [{ from: fromer, to: toer }, { from: toer, to: fromer }] }).sort({ "body.time": 1 }).exec(function (err, chats) {
                let msg = {};
                console.log('err', err);
                console.log('chats', chats);

                if (chats == null) {
                    msg['status'] = 'error';
                    res.send({ msg });
                }
                else if (err) {

                    msg['status'] = 'error';
                    throw err;
                } else {

                    let chat = chats[0];
                    var B = [];
                    for (var i = 0; i < chat.body.length; i++) {
                        if (chat.body[i].sender == toer) {
                            chat.body[i].status = 0;
                            B.push(chat.body[i]);
                        } else {
                            B.push(chat.body[i]);
                        }
                    };

                    Chat.update({ $or: [{ from: fromer, to: toer }, { from: toer, to: fromer }] }, { $set: { body: B } }).exec(function (err, chats) {
                    });
                    msg['status'] = 'ok';
                    msg['chats'] = chats;
                    res.send({ msg });
                }
            });
        }
    })
});

router.get('/getchat1/:to/:from', (req, res) => {//正在聊天时status=0
    var toer = req.params.to;
    var fromer = req.params.from;
    Chat.find({ $or: [{ from: fromer, to: toer }, { from: toer, to: fromer }] }).sort({ "body.time": 1 }).exec(function (err, chats) {
        let chat = chats[0];
        var B = [];
        for (var i = 0; i < chat.body.length; i++) {
            if (chat.body[i].sender == toer) {
                chat.body[i].status = 0;
                B.push(chat.body[i]);
            } else {
                B.push(chat.body[i]);
            }
        };

        Chat.update({ $or: [{ from: fromer, to: toer }, { from: toer, to: fromer }] }, { $set: { body: B } }).exec(function (err, chats) {
            if (err) throw err;
            console.log('1', chats)
        });
    });
});


//更改状态
router.get('/getstatus/:id', (req, res) => {
    var id = req.params.id;
    Chat.update({ _id: id }, { selling: 'false' }, function (err, chats) {
        let msg = {};
        if (err) {
            msg['status'] = 'error';
            throw err;
        }
        msg['status'] = 'ok';
        msg['chats'] = chats;
        res.send({ msg });
    });
});

module.exports = router;