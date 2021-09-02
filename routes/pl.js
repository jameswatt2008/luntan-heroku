const express = require('express');
const router = express.Router();

//引入db
let db = require('../db/db');
let Tz =db.Tz;//表
let Pl =db.Pl;//表
let User =db.User;
/************** 创建(create) 读取(get) 更新(update) 删除(delete) **************/

router.post('/addpl',function(req,res,next){    //发布评论
    let Tz_id = req.body.Tz_id;
    let Pl_userid = req.body.Pl_userid;
    let Pl_username = req.body.Pl_username;
    let Pl_touser = req.body.Pl_touser;
    let Pl_tx = req.body.Pl_tx;
    let Pl_text = req.body.Pl_text;

    let date = new Date();
    let Month = date.getMonth()+1;
    let Day = date.getDate();
    let Pl_time = Month + "/" + Day;

    let Pl_img = eval('(' + req.body.PlimgList + ')');
    let Pl_like = 0;
    let json1 ={Tz_id,Pl_userid,Pl_username,Pl_tx,Pl_time,Pl_text,Pl_img,Pl_like,Pl_touser}; 
    let pl = new Pl(json1);
    pl.save((err,pls)=>{
    let msg = {};
    if(err){
    msg['status'] = 'error';
    res.send({msg});
    throw err;
    }
    msg['status'] = 'ok';
    res.send({msg});
    });
    Tz.update({_id:Tz_id},{ $inc : { Pl : 1 } } ,function(err,pls){
    });
});

//评论点赞
router.post('/pldz',function(req,res,next){
    let tid = req.body.Tz_id;
    let pid = req.body.Pl_id;
    let pluser = req.body.Pl_user;
    let userid = req.body.User_id;
    let like = req.body.like;
    let P_like = req.body.P_like;//点赞数
    if(like=='false'){//点赞
    Pl.update({_id:pid,Tz_id:tid},{$addToSet:{Pl_likeuser:userid}},function(err,pls){
        console.log('点赞')
      let msg = {};
      if(err){
          msg['status'] = 'error';
          throw err;
      }
      msg['status'] = 'ok';
      res.send({msg});
      });
    Pl.update({_id:pid,Tz_id:tid},{$set:{Pl_like:P_like}},function(err,pls){
    });
    User.update({User_id:pluser},{ $inc : { Like : 1 } } ,function(err,pls){
    });
}
    else if(like=='true'){//取消点赞
    console.log('取消')
    Pl.update({_id:pid,Tz_id:tid},{$pull:{Pl_likeuser:userid}},function(err,pls){
        let msg = {};
        if(err){
            msg['status'] = 'error';
            throw err;
        }
        msg['status'] = 'ok';
        res.send({msg});
    });
    Pl.update({_id:pid,Tz_id:tid},{$set:{Pl_like:P_like}},function(err,pls){
    });
    User.update({User_id:pluser},{ $inc : { Like : -1 } } ,function(err,pls){
    });
    }
  });

//评论点踩
router.post('/pldc',function(req,res,next){
    let tid = req.body.Tz_id;
    let pid = req.body.Pl_id;
    let pluser = req.body.Pl_user;
    let userid = req.body.User_id;
    let like = req.body.like;
    let P_like = req.body.P_like;//点踩数
    if(like=='false'){//点踩
    Pl.update({_id:pid,Tz_id:tid},{$addToSet:{Pl_unlikeuser:userid}},function(err,pls){
        console.log('点踩')
      let msg = {};
      if(err){
          msg['status'] = 'error';
          throw err;
      }
      msg['status'] = 'ok';
      res.send({msg});
      });
    Pl.update({_id:pid,Tz_id:tid},{$set:{Pl_like:P_like}},function(err,pls){
    });
    User.update({User_id:pluser},{ $inc : { Like : -1 } } ,function(err,pls){
    });
}
    else if(like=='true'){//取消点赞
    console.log('取消')
    Pl.update({_id:pid,Tz_id:tid},{$pull:{Pl_unlikeuser:userid}},function(err,pls){
        let msg = {};
        if(err){
            msg['status'] = 'error';
            throw err;
        }
        msg['status'] = 'ok';
        res.send({msg});
    });
    Pl.update({_id:pid,Tz_id:tid},{$set:{Pl_like:P_like}},function(err,pls){
    });
    User.update({User_id:pluser},{ $inc : { Like : 1 } } ,function(err,pls){
    });
    }
  });

//获取评论
 router.post('/getpl',function(req,res,next){
    let id = req.body.Tz_id;
    let uid = req.body.User_id;
    Pl.find({Tz_id:id},function(err,pls){
        let msg = {};
        if(err){
            msg['status'] = 'error';
            throw err;
        }
        if (pls=='') {
            msg['status'] = 'none';
            res.send({msg});
        }
        else{
        for(let i = 0; i < pls.length; i++){//判断是否点赞
            if(pls[i].Pl_likeuser.length==0){
                pls[i].Pl_likeuser=false;
            }else if(pls[i].Pl_likeuser.indexOf(uid) > -1){
                pls[i].Pl_likeuser=true;
            }else{
                pls[i].Pl_likeuser=false;
            }
        }
        for(let i = 0; i < pls.length; i++){//判断是否点踩
            if(pls[i].Pl_unlikeuser.length==0){
                pls[i].Pl_unlikeuser=false;
            }else if(pls[i].Pl_unlikeuser.indexOf(uid) > -1){
                pls[i].Pl_unlikeuser=true;
            }else{
                pls[i].Pl_unlikeuser=false;
            }
        }
        msg['status'] = 'ok';
        msg['pls'] = pls;
        res.send({msg}); 
        }
   }).sort({Pl_like:-1});
  });
 //一个用户的所有评论
 router.get('/Userpl/:id',(req,res) => {
    var id=req.params.id;
    Pl.find({Pl_userid:id},function(err,pls){
        let msg = {};
        if(err){
            msg['status'] = 'error';
            throw err;
        }
        if(pls==null){
            msg['status'] = 'error';
            throw err;
        }
        msg['status'] = 'ok';
        msg['pls'] = pls;
        res.send({msg});
    }).sort({_id:-1});
 });

  //删除
  router.get('/delpl/:pid/:tid',(req,res) => {
    var pid=req.params.pid;
    var tid=req.params.tid;
    Pl.remove({_id:pid},function(err,pl){
        let msg = {};
        if(err){
            msg['status'] = 'error';
            throw err;
        }
        if(pl==null){
            msg['status'] = 'error';
            throw err;
        }else{
        msg['status'] = 'ok';
        res.send({msg});
    }
    });
    Tz.update({_id:tid},{ $inc : { Pl : -1 } } ,function(err,pls){
        if(err) throw err;
    });
 });

module.exports = router;