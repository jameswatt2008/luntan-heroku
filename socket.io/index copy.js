var app = require('express')();

var http = require('http').Server(app);
var io = require('socket.io')(http);

const express = require('express');

//引入db
let db = require('../db/db');
let Chat = db.Chat;//表

// app.get('/', function(req, res){
//   res.sendFile(__dirname + '/index.html');
// });

// app.use(express.static('./public'));


var usocket = {}, user = [];//user用户id，usocket用户socket
io.on('connection', function (socket) {//连接
	socket.on('new_user', (userid) => {//登录
		if (!(userid in usocket)) {
			socket.userid = userid;
			usocket[userid] = socket;
			user.push(userid);
			console.log('连接' + userid);
			socket.emit('login', user);//获取在线人
			socket.broadcast.emit('user_joined', userid, (user.length - 1));//回调
			console.log('用户表' + user);
		}
	});



	socket.on('send_private_message', function (res) {//私聊   存记录 判断indexof
		let from = res.from;
		let fname = res.fname;
		let ftx = res.ftx;
		let to = res.to;
		let tname = res.tname;
		let ttx = res.ttx;
		if (user.indexOf(res.to) > -1) {//如果在线用户
			usocket[res.to].emit('receive_private_message', res);//发送
			let body = {
				text: res.body,
				status: 0,//已读
				img: res.img,
				sender: res.from,
				ttime: res.time,
			};
			let json1 = { from, fname, ftx, to, tname, ttx, body };
			let chat = new Chat(json1);
			Chat.findOne({ $or: [{ from: from, to: to }, { from: to, to: from }] }, function (err, doc) {
				if (doc) {
					let resultFrom = doc.from;
					let resultTo = doc.to;
					Chat.updateOne({ from: resultFrom, to: resultTo }, { $push: { body: body } }, function (err) {
						console.log('插入一条聊天记录');
						if (err) throw err;
					})
				}
				else {
					chat.save((err, chat) => {
						if (err) throw err;
					});
				}
			});
		}
		else {
			let body = {
				text: res.body,
				status: 1,//未读
				img: res.img,
				sender: res.from,
				ttime: res.time,
			};
			let json1 = { from, fname, ftx, to, tname, ttx, body };
			let chat = new Chat(json1);
			Chat.findOne({ $or: [{ from: from, to: to }, { from: to, to: from }] }, function (err, doc) {
				if (doc) {
					let resultFrom = doc.from;
					let resultTo = doc.to;
					Chat.updateOne({ from: resultFrom, to: resultTo }, { $push: { body: body } }, function (err) {
						console.log('插入一条聊天记录');
						if (err) throw err;
					})
				}
				else {
					chat.save((err, chat) => {
						if (err) throw err;
					});
				}
			});
		}
	});



	socket.on('chatmessage', function (msg) {//发广播信息
		id = socket.id;
		io.emit('chatmessage', { msg, id });
		// console.log('message: ' + msg + socket.id);
	});


	socket.on('disconnect', function () {
		//移除
		if (socket.userid in usocket) {
			delete (usocket[socket.userid]);
			user.splice(user.indexOf(socket.userid), 1);
		}
		console.log('断开' + socket.userid);
		socket.broadcast.emit('user_left', socket.userid)
	})
});


http.listen(3001, function () {
	console.log('socket.IO  *3001');
});

var router = express.Router();

module.exports = router;

