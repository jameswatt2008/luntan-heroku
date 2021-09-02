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
let Tz = db.Tz;//表
let Pl = db.Pl;//表
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

router.post('/addpost', function (req, res, next) {    //发布帖子
    let User_id = req.body.User_id;
    let User_name = req.body.User_name;
    let User_tx = req.body.User_tx;
    let date = new Date();
    let Month = date.getMonth() + 1;
    let Day = date.getDate();
    let Tz_time = Month + "/" + Day;
    let Tz_type = req.body.Tz_type;
    let Tz_text = req.body.Tz_text;
    let Tz_img = eval('(' + req.body.TzimgList + ')');
    let Tz_like = 0;
    let Tz_show = true;
    let Tz_ok = '未审核';
    let Pl = 0;
    let json1 = { User_id, User_name, User_tx, Tz_time, Tz_type, Tz_text, Tz_img, Tz_like, Tz_show, Tz_ok, Pl };
    let tz = new Tz(json1);
    tz.save((err, tzs) => {
        let msg = {};
        if (err) {
            msg['status'] = 'error';
            res.send({ msg });
            throw err;
        }
        msg['status'] = 'ok';
        res.send({ msg });
    });
});

//帖子点赞
router.post('/postdz', function (req, res, next) {
    let id = req.body.Tz_id;
    let tzuser = req.body.Tz_user;
    let userid = req.body.User_id;
    let like = req.body.like;
    let T_like = req.body.T_like;
    if (like == 'false') {
        Tz.update({ _id: id }, { $addToSet: { Tz_likeuser: userid } }, function (err, tzs) {
            let msg = {};
            if (err) {
                msg['status'] = 'error';
                throw err;
            }
            msg['status'] = 'ok';
            res.send({ msg });
        });
        User.update({ User_id: userid }, { $addToSet: { User_dz: id } }, function (err, tzs) {
            if (err) {
                throw err;
            }
        });
        Tz.update({ _id: id }, { $set: { Tz_like: T_like } }, function (err, tzs) {
            if (err) {
                throw err;
            }
        });
        User.update({ User_id: tzuser }, { $inc: { Like: 1 } }, function (err, pls) {
            if (err) {
                throw err;
            }
        });
    }
    else if (like == 'true') {
        Tz.update({ _id: id }, { $pull: { Tz_likeuser: userid } }, function (err, tzs) {
            let msg = {};
            if (err) {
                msg['status'] = 'error';
                throw err;
            }
            msg['status'] = 'ok';
            res.send({ msg });
        });
        User.update({ User_id: userid }, { $pull: { User_dz: id } }, function (err, tzs) {
            if (err) {
                throw err;
            }
        });
        Tz.update({ _id: id }, { $set: { Tz_like: T_like } }, function (err, tzs) {
            if (err) {
                throw err;
            }
        });
        User.update({ User_id: tzuser }, { $inc: { Like: -1 } }, function (err, pls) {
            if (err) {
                throw err;
            }
        });
    }
});

//帖子点踩
router.post('/postdc', function (req, res, next) {
    let id = req.body.Tz_id;
    let tzuser = req.body.Tz_user;
    let userid = req.body.User_id;
    let unlike = req.body.unlike;
    let T_like = req.body.T_like;
    if (unlike == 'false') {
        Tz.update({ _id: id }, { $addToSet: { Tz_unlikeuser: userid } }, function (err, tzs) {
            let msg = {};
            if (err) {
                msg['status'] = 'error';
                throw err;
            }
            msg['status'] = 'ok';
            res.send({ msg });
        });
        Tz.update({ _id: id }, { $set: { Tz_like: T_like } }, function (err, tzs) {
            if (err) {
                throw err;
            }
        });
        User.update({ User_id: tzuser }, { $inc: { Like: -1 } }, function (err, pls) {
            if (err) {
                throw err;
            }
        });
    }
    else if (unlike == 'true') {
        Tz.update({ _id: id }, { $pull: { Tz_unlikeuser: userid } }, function (err, tzs) {
            let msg = {};
            if (err) {
                msg['status'] = 'error';
                throw err;
            }
            msg['status'] = 'ok';
            res.send({ msg });
        });
        Tz.update({ _id: id }, { $set: { Tz_like: T_like } }, function (err, tzs) {
            if (err) {
                throw err;
            }
        });
        User.update({ User_id: tzuser }, { $inc: { Like: 1 } }, function (err, pls) {
            if (err) {
                throw err;
            }
        });
    }
});

//获取帖子
router.post('/getpost', function (req, res, next) {
    let id = req.body.User_id;
    let type = req.body.Tz_type;
    let page = req.body.page;
    if (type != 'all') {//按类型获取
        console.log(type)
        // Tz_ok:'通过'
        // {Tz_type:type,Tz_show:true,Tz_ok:'通过'}
        Tz.find({ Tz_type: type, Tz_show: true }, function (err, tzs) {
            let msg = {};
            if (err) {
                msg['status'] = 'error';
                throw err;
            }
            if (tzs == null) {
                msg['status'] = 'error';
                throw err;
            }
            for (let i = 0; i < tzs.length; i++) {//判断是否点赞
                if (tzs[i].Tz_likeuser.length == 0) {
                    tzs[i].Tz_likeuser = false;
                } else if (tzs[i].Tz_likeuser.indexOf(id) > -1) {
                    tzs[i].Tz_likeuser = true;
                } else {
                    tzs[i].Tz_likeuser = false;
                };

                if (tzs[i].Tz_unlikeuser.length == 0) {
                    tzs[i].Tz_unlikeuser = false;
                } else if (tzs[i].Tz_unlikeuser.indexOf(id) > -1) {
                    tzs[i].Tz_unlikeuser = true;
                } else {
                    tzs[i].Tz_unlikeuser = false;
                };
            }
            msg['status'] = 'ok';
            msg['tzs'] = tzs;
            res.send({ msg });
        }).sort({ _id: -1 }).limit(5).skip(page * 5)
    }
    else {//获取所有
        // { Tz_show: true, Tz_ok: '通过' }
        Tz.find({ Tz_show: true }, function (err, tzs) {
            let msg = {};
            if (err) {
                msg['status'] = 'error';
                throw err;
            }
            if (tzs == null) {
                msg['status'] = 'error';
                throw err;
            }
            for (let i = 0; i < tzs.length; i++) {//判断是否点赞
                if (tzs[i].Tz_likeuser.length == 0) {
                    tzs[i].Tz_likeuser = false;
                } else if (tzs[i].Tz_likeuser.indexOf(id) > -1) {
                    tzs[i].Tz_likeuser = true;
                } else {
                    tzs[i].Tz_likeuser = false;
                };

                if (tzs[i].Tz_unlikeuser.length == 0) {
                    tzs[i].Tz_unlikeuser = false;
                } else if (tzs[i].Tz_unlikeuser.indexOf(id) > -1) {
                    tzs[i].Tz_unlikeuser = true;
                } else {
                    tzs[i].Tz_unlikeuser = false;
                };
            }
            msg['status'] = 'ok';
            msg['tzs'] = tzs;
            res.send({ msg });
        }).sort({ _id: -1 }).limit(5).skip(page * 5)
    }
});


//帖子详情
router.get('/Postdetails/:id/:tid', (req, res) => {
    var id = req.params.id;
    var tid = req.params.tid;
    Tz.findOne({ _id: tid }, function (err, tzd) {
        let msg = {};
        if (err) {
            msg['status'] = 'error';
            throw err;
        }
        if (tzd == null) {
            msg['status'] = 'error';
            throw err;
        }
        if (tzd.Tz_likeuser.length == 0) {//判断是否点赞
            tzd.Tz_likeuser = false;
        } else if (tzd.Tz_likeuser.indexOf(id) > -1) {
            tzd.Tz_likeuser = true;
        } else {
            tzd.Tz_likeuser = false;
        }

        if (tzd.Tz_unlikeuser.length == 0) {//判断是否点赞
            tzd.Tz_unlikeuser = false;
        } else if (tzd.Tz_unlikeuser.indexOf(id) > -1) {
            tzd.Tz_unlikeuser = true;
        } else {
            tzd.Tz_unlikeuser = false;
        }
        msg['status'] = 'ok';
        msg['tzd'] = tzd;
        res.send({ msg });
    });
});

//一个用户的所有帖子
router.get('/Userpost/:id', (req, res) => {
    var id = req.params.id;
    Tz.find({ User_id: id }, function (err, utz) {
        let msg = {};
        if (err) {
            msg['status'] = 'error';
            throw err;
        }
        if (utz == null) {
            msg['status'] = 'error';
            throw err;
        }
        msg['status'] = 'ok';
        msg['utz'] = utz;
        res.send({ msg });
    }).sort({ _id: -1 });
});
//一个用户浏览记录
router.post('/Userlook', function (req, res, next) {
    const list = req.body['list[]']
    Tz.find({ _id: { $in: list } }, (err, data) => {
        if (err) throw err;
        res.send(data)
    }).sort({ _id: -1 })
});

//单条帖子
router.get('/plpost/:tid', (req, res) => {
    var tid = req.params.tid;
    Tz.findOne({ _id: tid }, function (err, tzd) {
        if (err) {
            throw err;
        }
        if (tzd == null) {
            throw err;
        } else {
            res.send({ tzd });
        }
    });
});

//删除
router.get('/delpost/:tid', (req, res) => {
    var tid = req.params.tid;
    Tz.remove({ _id: tid }, function (err, tzd) {
        let msg = {};
        if (err) {
            msg['status'] = 'error';
            throw err;
        }
        if (tzd == null) {
            msg['status'] = 'error';
            throw err;
        } else {
            msg['status'] = 'ok';
            res.send({ msg });
        }
    });
});

router.post('/search', function (req, res, next) {
    let str = req.body.searchstr;
    let reg = new RegExp(str, 'i');//封装正则表达式，i表示不区分大小写
    Tz.find({
        $or: [
            { Tz_text: { $regex: reg } },
            { Tz_type: { $regex: reg } },
            { User_name: { $regex: reg } },
        ]
    }, (err, data) => {
        if (err) throw err;
        res.send(data)
    }).sort({ _id: -1 })
});

//后台
//获取通过帖子
router.get('/gettz/:ok', function (req, res, next) {
    var ok = req.params.ok;
    Tz.find({ Tz_ok: ok }, function (err, tzs) {
        if (err) {
            throw err;
        }
        if (tzs == null) {
        }
        else {
            res.send(tzs);
        }
    }).sort({ _id: -1 })
});

router.post('/tzok', function (req, res, next) {
    let id = req.body.id;
    let ok = req.body.ok;
    Tz.update({ _id: id }, { $set: { Tz_ok: ok } }, function (err, tzs) {
        if (err) {
            throw err;
        }
    })
});

module.exports = router;