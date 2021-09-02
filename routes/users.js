var express = require('express');
var router = express.Router();
const crypto = require('crypto');

//引入db
  let db = require('../db/db');
  let User =db.User;
  let Tz =db.Tz;//表
//注册
  router.post('/adduser',function(req,res,next){
  let User_id = req.body.User_id;
  let md5 = crypto.createHash('md5');
  let Psw = md5.update(req.body.Psw).digest('hex');
  let User_name = req.body.User_name;
  let Email = req.body.Email;
  let User_sex = '无';
  let User_intro = "楼主很懒！什么也没留下";
  let Like = 0;
  let User_tx = 'static/img/tx.jpg';
  let json1 ={User_id,Psw,User_name,Email,User_sex,User_intro,Like,User_tx}; 
  let user = new User(json1);
  User.find({User_id:User_id},function(err,obj){
    let msg ={};
    if(err){
      console.log("Error:" + err);
      msg['status'] = 'error';
      res.send({msg})
    }
    else{
      if(obj.length == 0){
            user.save(json1,(err,user)=>{
            if(err){
                msg['status'] = 'error';
                throw err;
            }
            msg['status'] = 'ok';
            msg['user'] = user;
            console.log("注册账号:" + {msg});
            res.send({msg});
        });
       }
       else if(obj.length>0){
        msg['status'] = 'same';
        msg['user'] = user;
        console.log("注册失败:" + user);
        res.send({msg});
       }
    }
  })
});


//登录
router.post('/Login',function(req,res,next){
  let id = req.body.User_id;
  let md5 = crypto.createHash('md5');
  let Psw = md5.update(req.body.Psw).digest('hex');
  User.findOne({User_id:id},function(err,obj){
    let msg ={};
    if(err){
      console.log("Error:" + err);
      msg['status'] = 'error';
      res.send({msg})
    } 
    else if(obj==null){
      console.log('没有该账号')
      msg['status'] = 'none';
      res.send({msg})
    }
    else{
      if(obj.User_id==id && obj.Psw==Psw){
        console.log('登录成功')
        msg['status'] = 'true';
        msg['user'] = obj;
        res.send({msg})
      }
      else{
        console.log('密码错误')
        msg['status'] = 'false';
        res.send({msg})
      }
    }
  })
});

//自动登录
router.post('/Autologin',function(req,res,next){
  let id = req.body.User_id;
  User.findOne({User_id:id},function(err,obj){
    let msg ={};
    if(err){
      console.log("Error:" + err);
      msg['status'] = 'error';
      res.send({msg})
    } 
    else if(obj==null){
      console.log('没有该账号')
      msg['status'] = 'none';
      res.send({msg})
    }
    else{
        console.log('登录成功')
        msg['status'] = 'true';
        msg['user'] = obj;
        res.send({msg})
    }
  })
});


//修改名字
router.post('/S_name',function(req,res,next){
  let id = req.body.User_id;
  let name = req.body.User_name;
  User.update({User_id:id},{$set:{User_name:name}},function(err,user){
    let msg = {};
    if(err){
        msg['status'] = 'error';
        throw err;
    }
    msg['status'] = 'ok';
    msg['user'] = name;
    res.send({msg});
});
  Tz.update({User_id:id},{$set:{User_name:name}},{multi:true},function(err,tzuser){
    console.log('帖子修改ok')
  });
});

//修改性别
router.post('/S_sex',function(req,res,next){
  let id = req.body.User_id;
  let sex = req.body.User_sex;
  User.update({User_id:id},{$set:{User_sex:sex}},function(err,user){
    let msg = {};
    if(err){
        msg['status'] = 'error';
        throw err;
    }
    msg['status'] = 'ok';
    msg['user'] = sex;
    res.send({msg});
});
});

//修改签名
router.post('/S_intro',function(req,res,next){
  let id = req.body.User_id;
  let intro = req.body.User_intro;
  User.update({User_id:id},{$set:{User_intro:intro}},function(err,user){
    let msg = {};
    if(err){
        msg['status'] = 'error';
        throw err;
    }
    msg['status'] = 'ok';
    msg['user'] = intro;
    res.send({msg});
});
});

//修改头像
router.post('/S_tx',function(req,res,next){
  let id = req.body.User_id;
  let tx = req.body.User_tx;
  User.update({User_id:id},{$set:{User_tx:tx}},function(err,user){
    let msg = {};
    if(err){
        msg['status'] = 'error';
        throw err;
    }
    msg['status'] = 'ok';
    msg['user'] = tx;
    res.send({msg});
});
  Tz.update({User_id:id},{$set:{User_tx:tx}},{multi:true},function(err,tzuser){
    if(err) throw err;
  });
});

//修改密码
router.post('/S_psw',function(req,res,next){ 
  let id = req.body.User_id;
  let md5 = crypto.createHash('md5');
  let psw = md5.update(req.body.psw).digest('hex');
  md5 = crypto.createHash('md5');
  let psw2 = md5.update(req.body.psw2).digest('hex');
  User.updateOne({User_id:id,Psw:psw},{$set:{Psw:psw2}},function(err,user){
    let msg = {};
    console.log(user.n)
    if(err){
        msg['status'] = 'error';
        throw err;
    }
    else{
    msg['status'] = 'ok';
    msg['user'] = user;
    res.send({msg});
    }
});
});

//获取like用户列表
router.post('/alllist',function(req,res,next){
  const list = req.body['list[]']
  User.find({User_id:{$in:list}},(err,data) =>{
    if(err) throw err;
    res.send(data)
  })
});

router.post('/addlook',function(req,res,next){//添加浏览记录
  let id = req.body.id;
  let tid = req.body.tid;
  User.update({User_id:id},{ $addToSet: { User_look : tid } } ,function(err,doc){
    if(err) throw err;
  });
});

router.post('/addflow',function(req,res,next){//关注
  let id = req.body.id;
  let fid = req.body.fid;
  User.update({User_id:id},{ $addToSet: { Flow : fid } } ,function(err,doc){
    if(err) throw err;
  });
  User.update({User_id:fid},{ $addToSet: { Friend : id } } ,function(err,doc){
    if(err) throw err;
  });
});

router.post('/removeflow',function(req,res,next){//取消关注
  let id = req.body.id;
  let fid = req.body.fid;
  User.update({User_id:id},{ $pull: { Flow : fid } } ,function(err,doc){
    if(err) throw err;
  });
  User.update({User_id:fid},{ $pull: { Friend : id } } ,function(err,doc){
    if(err) throw err;
  });
});


//后台
router.get('/getuser',function(req,res,next){//获取用户
  User.find({},function(err,obj){
    if(err){
      throw err;
    }
    else if(obj==null){
      console.log('没有用户')
    }
    else{
      return res.send(obj)
    }
  })
});

router.post('/deluser',function(req,res,next){//删除用户
  let id = req.body.id;
  User.remove({_id:id},function(err,doc){
    if(err) throw err;
  });
});

module.exports = router;
