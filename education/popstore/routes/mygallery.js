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

router.get('/', function(req, res, next) {
    if (req.session && req.session.user_id){
        var user_id = req.session.user_id;

        var conn = mysql.createConnection(global.db_option);
        conn.connect(function (err) {
            var sql = `select O.image_id, O.user_id, I.origin_path, I.image_name, I.filesize, I.filetype, I.timestamp from OWN_IMAGE O JOIN IMAGE I ON O.image_id = I.image_id where O.user_id = '${user_id}'`;
                conn.query(sql, function (err, result) {
                    if (err){
                      alert(err);
                      return false;
                    } 
                    res.render('mypage',{imageList : result});
                    conn.end();
                });
            });
    }
    else{
        res.render('index')
    }
});

// router.post('/', function(req, res)
// {
//     console.log("image id find start")
//     function select(req, res) {
//         var user_id = req.session.user_id;

//         var conn = mysql.createConnection(global.db_option);
//         conn.connect(function (err) {
//             var sql = `select O.image_id, O.user_id, I.origin_path, I.image_name, I.filesize, I.filetype, I.timestamp from OWN_IMAGE O JOIN IMAGE I ON O.image_id = I.image_id where O.user_id = '${user_id}'`;
//                 conn.query(sql, function (err, result) {
//                     if (err) throw err;
//                     res.json(result);
//                     conn.end();
//                 });
//             });

//     };
//     select(req,res);
// });


module.exports = router;
