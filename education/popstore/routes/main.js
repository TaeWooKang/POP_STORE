const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require("path");
require('date-utils');
var mysql = require('mysql');
var request = require('request');
var alert = require('alert-node');
const crypto = require('crypto');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);

router.get('/', function(req, res) {
    var board_content = {};
    if (req.session && req.session.user_id) {
        console.log("borad loadind start")
        function select(req, res) {
            var conn = mysql.createConnection(global.db_option);
            conn.connect(function (err) {
                var sql = `select * from BOARD;`
                conn.query(sql, function (err, result) {
                    if (err) console.log(err);
                    var sql2 = `select B.BOARD_NO,B.image_id,I.copy_path from BOARD B JOIN IMAGE I ON B.image_id = I.image_id`;
                    conn.query(sql2, function (err, result2) {
                        if (err) console.log(err);
                        var sql3 = `select board_no, tagged from BOARD_TAG;`
                        conn.query(sql3, function(err,result3){ //load tag info
                            if(err) console.log(err);
                            var sql4 = `select * from IMAGE order by image_seq desc limit 10;`;
                            conn.query(sql4, function(err,result4){ //load tag info
                            res.render('main',{board_content : result, image:result2, board_tag:result3, all_image: result4});
                            conn.end();
                        });
                        });
                    });
                });
            });
        };
        select(req, res);
    }
    else{
        res.render('index');
    }
});

router.post('/', function(req, res){
    console.log("image id find start")
    function select(req, res) {
        var user_id = req.session.user_id;

        var conn = mysql.createConnection(global.db_option);
        conn.connect(function (err) {
            var sql = `select O.image_id, O.user_id, I.copy_path, I.image_name, I.filesize, I.filetype, I.timestamp from OWN_IMAGE O JOIN IMAGE I ON O.image_id = I.image_id where O.user_id = '${user_id}'`;
                conn.query(sql, function (err, result) {
                    if (err) throw err;
                    res.json(result);
                    console.log("image 불러오기 완료");
                    conn.end();
                });
            });
    };
    select(req,res);
});

router.post('/load_more', function(req,res){
    var load_count = req.body.load_count;
    var conn = mysql.createConnection(global.db_option);
    conn.connect(function (err) {                    
        var sql = `select * from IMAGE order by image_seq desc limit 10 offset ${load_count};`;
        conn.query(sql, function(err,result){ //load tag info
            conn.end();
            res.json({load_image: result});
        });
    });
});
module.exports = router;
