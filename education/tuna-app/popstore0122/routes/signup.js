var express = require('express');
var app = express();
var mysql = require('mysql');
var request = require('request');
var bodyParser = require('body-parser');
var alert = require('alert-node');
var router = express.Router();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

router.get('/', function (req, res) {
    res.render('signup');
});

router.post('/', function (req,res){
    console.log('sign up request');
    var user_id = req.body.user_id;
    var password = req.body.password;
    var user_nickname = req.body.user_nickname;
    var user_name = req.body.user_name;
    var phone = req.body.phone;
    var email = req.body.email;
    var point = 10000;
    var conn = mysql.createConnection(global.db_option);
    conn.connect(function(err){
        if (err) throw err;
        console.log("connected.");
        var sql = `insert into USER 
    values ('${user_id}','${password}','${user_nickname}','${user_name}','${phone}','${email}',"NULL",now(),${point})`;
        conn.query(sql, function(err,result){
            if (err) throw err;
            conn.end();
        });
    });
    res.redirect('signupcomplete');
});

router.post('/duplicate_check',function (req,res){
    console.log('duplicate check..');

    var value = req.body[0];
    var method = req.body[1];
    var conn = mysql.createConnection(global.db_option);
    conn.connect(function(err){
        var data ={}
        if (err) throw err;
        console.log("connected.");

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