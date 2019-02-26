var express = require('express');
var app = express();
var mysql = require('mysql');
var request = require('request');
var bodyParser = require('body-parser');
var alert = require('alert-node');
var session = require('express-session');
var router = express.Router();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));


router.get('/', function (req, res) {
    res.render('profile');
});

router.post('/get_profile', function (req,res){
    console.log('get profile....');

    var user_id = req.session.user_id;
    console.log(user_id)
    var user_data = {};
    var conn = mysql.createConnection(global.db_option);
    conn.connect(function(err){
        if (err) throw err;
        console.log("connected.");
        var conn = mysql.createConnection(global.db_option);
        var sql = `select * from USER where user_id='${user_id}';`
        conn.query(sql, function(err,result){
            user_data.key = result[0];
            res.json(user_data);
            conn.end();
        });
    });
});

router.get('/profilesignin', function (req, res) {
    if (req.session.profilesignin){
        res.render('profilechange');
    }
    else{
        res.render('profilesignin');
    }

});

router.post('/profilesignin', function (req, res) {
    var user_id = req.session.user_id;
    var password = req.body.password;
    var conn = mysql.createConnection(global.db_option);
    conn.connect(function (err) {
        var data = -1;
        if (err) throw err;
        var sql = `select user_id from USER where user_id = '${user_id}' AND password = '${password}' `;
        conn.query(sql, function (err, result) {
            if (err) {
                // throw err;
                // 오류 메시지 처리
                data = err;
                conn.end();
                res.json(data);
                console.log('profilesignin failed')
            }
            if (result ==""){
                data = 0;
                // res.send('<script type="text/javascript">alert("아이디를 확인해 주세요");\n' +
                //     'window.location = "/profile/profilesignin";</script>');
                conn.end();
                res.json(data)
            }else{
                if (req.session === undefined) {
                    console.log(`req.session is undefined`);
                    conn.end();
                    res.redirect('login');
                }
                else {
                    data=1;
                    req.session.profilesignin = req.session.user_id;
                    req.session.save(function () {
                        // alert('인증 성공');
                        conn.end();
                        res.json(data);
                    });
                }
            }
        });
    });
});

router.get('/profilechange', function (req, res) {
    if (req.session.profilesignin == req.session.user_id){
        res.render('profilechange');

    }
    else{
        alert("인증 후 접근가능합니다.");
        res.render('profilesignin');
    }
});
router.post('/profilechange', function (req, res) {
    var user_id = req.body.change_userid;
    var user_nickname = req.body.change_usernickname;
    var user_phone = req.body.change_phone;
    var user_email = req.body.change_email;
    var conn = mysql.createConnection(global.db_option);
    conn.connect(function (err) {
        var sql = `update USER set user_nickname='${user_nickname}',
      phone='${user_phone}', email='${user_email}' where user_id = '${user_id}'`;
        conn.query(sql, function (err, result) {
            if (err) {
                alert(err);
                res.redirect('/profile');
                console.log('change failed')
            }
            else{
                req.session.user_nickname = user_nickname;
                req.session.profilesignin = "";
                res.redirect('/profile')
            }
            conn.end();
        });
    });
});

router.get('/profilechange_cancel', function (req, res) {
    req.session.profilesignin = "";
    res.redirect('/profile')
});

router.post('/duplicate_check',function (req,res){
    console.log('duplicate check..');
    var user_id = req.session.user_id;
    var value = req.body[0];
    var method = req.body[1];
    var conn = mysql.createConnection(global.db_option);
    conn.connect(function(err){
        var data ={}
        if (err) throw err;
        console.log("connected.");

        var sql = `select user_nickname from USER where user_id='${user_id}';`
        conn.query(sql, function(err,result){
            console.log(result)
            if(err){
                throw err;
            }
            else{
                origin_nickname=result[0].user_nickname
            }
        });

        var sql = `select ${method} from USER where ${method}='${value}';`
        conn.query(sql, function(err,result){
            console.log(result)
            if(err){
                throw err;
            }
            else if(result==""){
                console.log(`"사용가능 ${method}"`)
                data = 1;
            }
            else if(origin_nickname==result[0].user_nickname){
                console.log(`"변화없음 ${result[0].user_nickname}"`)
                data = 2;
            }
            else{
                console.log(`"불가능한 ${method}"`)
                data = 0;
            }
            console.log("전송 직전",data);
            conn.end();
            res.json(data);
        });
    });
});
module.exports = router;