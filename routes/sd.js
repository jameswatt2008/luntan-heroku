const express = require('express');
const router = express.Router();


//引入db
let db = require('../db/db');
let User =db.User;
let Sd = db.Sd;
/************** 创建(create) 读取(get) 更新(update) 删除(delete) **************/

router.post('/addsd',function(req,res,next){    //发布树洞
    let User_id=req.body.User_id;
    let Nick_name=req.body.Nick_name;
    let Pl = 0;
    let Sd_like = 0;

    let date = new Date();
    let Month = date.getMonth()+1;
    let Day = date.getDate();
    let Sd_time = Month + "/" + Day;

    let Sd_text = req.body.Sd_text;
    
    let json1 ={User_id,Nick_name,Pl,Sd_time,Sd_text,Sd_like}; 
    let sd = new Sd(json1);
    sd.save((err,sds)=>{
    let msg = {};
    if(err){
    msg['status'] = 'error';
    res.send({msg});
    throw err;
    }
    msg['status'] = 'ok';
    res.send({msg});
    });
});

router.post('/sdpl',function(req,res,next){    //树洞评论
    let id = req.body.Sd_id;
    let Pl_id = req.body.User_id;
    let Pl_nick = req.body.Nick_name;
    let Pl_text = req.body.Pl_text;

    let date = new Date();
    let Month = date.getMonth()+1;
    let Day = date.getDate();
    let Pl_time = Month + "/" + Day;

    let json1 ={Pl_id,Pl_nick,Pl_time,Pl_text}; 
    Sd.update({_id:id},{$push:{Pl_msg:json1}},function(err,tzs){
        let msg = {};
        if(err){
            msg['status'] = 'error';
            throw err;
        }
        msg['status'] = 'ok';
        res.send({msg});
    });
});
//点赞
router.post('/sddz',function(req,res,next){
    let id = req.body.Sd_id;
    let userid = req.body.User_id;
    let like = req.body.like;
    if(like=='false'){
    Sd.update({_id:id},{$addToSet:{Sd_likeuser:userid}},function(err,tzs){
      let msg = {};
      if(err){
          msg['status'] = 'error';
          throw err;
      }
      msg['status'] = 'ok';
      res.send({msg});
      });
    Sd.update({_id:id},{ $inc : { Sd_like : 1 } } ,function(err,pls){
    });
}
    else if(like=='true'){
    Sd.update({_id:id},{$pull:{Sd_likeuser:userid}},function(err,tzs){
        let msg = {};
        if(err){
            msg['status'] = 'error';
            throw err;
        }
        msg['status'] = 'ok';
        res.send({msg});
    });
    Sd.update({_id:id},{ $inc : { Sd_like : -1 } } ,function(err,pls){
    });
    }
  });

//获取树洞
 router.post('/getsd',function(req,res,next){
    let id = req.body.User_id;
    Sd.find({},function(err,sds){
    let msg = {};
    if(err){
        msg['status'] = 'error';
        throw err;
    }
    if(sds==null){
        msg['status'] = 'error';
        throw err;
    }
    for(let i = 0; i < sds.length; i++){//判断是否点赞
        if(sds[i].Sd_likeuser.length==0){
            sds[i].Sd_likeuser=false;
        }else if(sds[i].Sd_likeuser.indexOf(id) > -1){
            sds[i].Sd_likeuser=true;
        }else{
            sds[i].Sd_likeuser=false;
        };
    }
    msg['status'] = 'ok';
    msg['sds'] = sds;
    res.send({msg});
}).sort({_id:-1});
});

 
//树洞详情
 router.get('/sdd/:id/:sdid',(req,res) => {
    var id=req.params.id;
    var sdid = req.params.sdid;
    Sd.findOne({_id:sdid},function(err,sdd){
        let msg = {};
        if(err){
            msg['status'] = 'error';
            throw err;
        }
        if(sdd==null){
            msg['status'] = 'error';
            throw err;
        }
            if(sdd.Sd_likeuser.length==0){//判断是否点赞
                sdd.Sd_likeuser=false;
            }else if(sdd.Sd_likeuser.indexOf(id) > -1){
                sdd.Sd_likeuser=true;
            }else{
                sdd.Sd_likeuser=false;
            }
        msg['status'] = 'ok';
        msg['sdd'] = sdd;
        res.send({msg});
    });
 });

 //一个用户的所有帖子
 router.get('/Usersd/:id',(req,res) => {
    var id=req.params.id;
    Sd.find({User_id:id},function(err,utz){
        if(err)throw err;
        res.send({utz});
    });
 });

//删除
router.get('/delsd/:sid',(req,res) => {
var sid=req.params.sid;
Sd.remove({_id:sid},function(err,doc){
    let msg = {};
    if(err){
        msg['status'] = 'error';
        throw err;
    }
    if(doc==null){
        msg['status'] = 'error';
        throw err;
    }else{
    msg['status'] = 'ok';
    res.send({msg});
}
});
});

module.exports = router;