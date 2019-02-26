var express = require('express');
var app = express();
var mysql = require('mysql');
var request = require('request');
var bodyParser = require('body-parser');
var session = require('express-session');
var router = express.Router();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));


router.get('/', function (req, res) {
    res.render('login');
});

router.post('/', function (req, res) {

    var user_id = req.body.user_id;
    var password = req.body.password;
    var conn = mysql.createConnection(global.db_option);
    var data = 0;
    conn.connect(function (err) {
        if (err) throw err;

        var sql = `select * from USER where user_id = '${user_id}' AND password = '${password}' `;

        conn.query(sql, function (err, result) {
            if (err) {
                // throw err;
                // 오류 메시지 처리
                console.log('login failed')
            }
            if (result ==""){
                res.json(data);
                console.log('login failed')
            }else{
                data = 1;
                req.session.user_id=user_id;
                req.session.user_nickname = result[0].user_nickname
                req.session.save();
                res.json(data);
            }
            conn.end();
        });
    });
});
router.get('/findID', function (req, res) {
    res.render('findID');
});

router.post('/findID', function (req,res){
    var email = req.body.email;
    var conn = mysql.createConnection(global.db_option);
    // 쿼리 실행
    conn.connect(function(err){
        if (err) throw err;
        console.log("connected.");
        var sql = `select user_id from USER where email='${email}';`
        conn.query(sql, function(err,result){
            if(err){
                console.log(err);
                throw err;
            }
            else{
                result = JSON.stringify(result)
                result = JSON.parse(result);
                res.json(result);
            }
            conn.end()
        });
    })
});

router.get('/findPW', function (req, res) {
    res.render('findPW');
});

router.post('/findPW', function findPW(req, res){
    var user_id = req.body.user_id;
    var email = req.body.email;
    var conn = mysql.createConnection(global.db_option);
    // 쿼리 실행
    conn.connect(function(err){
        if (err) throw err;
        console.log("connected.");
        var sql = `select * from USER where user_id ='${user_id}' AND email='${email}';`;
        conn.query(sql, function(err,result){
            if(err){
                console.log(err);
                throw err;
            }
            else{
                result = JSON.stringify(result);
                result = JSON.parse(result);
                req.session.user_id_findPW = req.body.user_id;
                req.session.save()
                res.json(result);
            }
            conn.end()
        });
    })
});

module.exports = router;