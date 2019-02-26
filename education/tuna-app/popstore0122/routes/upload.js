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
var jquery = require('jquery');
var jsdom = require('jsdom');
var watermark = require('dynamic-watermark');
var sizeOf = require('image-size');

var dt = new Date();
var d = dt.toFormat('YYYY-MM-DD HH24:MI:SS');

let storage = multer.diskStorage({
    destination: function(req, file ,callback){
        callback(null, "photo/")
    },
    filename: function(req, file, callback){
        let extension = path.extname(file.originalname);
        let basename = path.basename(file.originalname, extension);
        callback(null, basename + "-" + Date.now() + extension);
        filename2 = basename + "-" + Date.now() + extension
    }
});

let upload = multer({
    storage: storage
});

router.post('/create', upload.single("imgFile"), function(req, res, next) {

    let file = req.file
    if (file ==undefined){
        res.send("imageundefined");
        // res.redirect('/upload');
    }else if (file.mimetype != 'image/jpeg'){
        res.send("typeError");
    }else{
    let result = {
        originalname: file.originalname,
        filename: file.filename,
        path: file.path,
        size: file.size,
    };

    imageupload = function imageupload(req,res) {
        var user_id=req.session.user_id;
        var image_id = " ";
        var image_name = filename2;
        var origin_path = file.path;
        var blind = " ";
        var filesize = file.size;
        var filetype = path.extname(file.originalname);
        var copy_name = "copy-"+image_name;
        var copy_path = "photocopy/"+copy_name;
        var logo_path = "static/watermark.png";
        // origin_path = origin_path.replace("\\", "\\\\");
        image_id = crypto.createHash('sha512').update(filename2).digest('base64');

        var conn = mysql.createConnection(global.db_option);
        
        conn.connect(function (err) {
            if (err) throw err;
            var sql = `insert into IMAGE (image_id, image_name, origin_path, copy_path, blind, filesize, filetype, creater, timestamp) values ('${image_id}','${image_name}','${origin_path}','${copy_path}','${blind}','${filesize}','${filetype}','${user_id}', now());`;
            conn.query(sql, function (err, result) {
                if (err) throw err;
            });
            var sql2 = `insert into OWN_IMAGE (image_id, user_id, timestamp) values ('${image_id}','${user_id}',now());`;
            conn.query(sql2, function (err, result2) {
                if (err) throw err;
            });
            var sql3 = `update USER set point = point+1000 where user_id='${user_id}';`
            conn.query(sql3, function(err,result3) {//hit + 1
                if (err) throw err;
                conn.end();
                var dimensions = sizeOf(origin_path);
                console.log(dimensions.width)
                console.log(dimensions.height)
                var logo_x = (dimensions.width/2);
                var logo_y = (dimensions.height/2);
                var logo_w = (dimensions.width/2);
                var logo_h = (logo_w/2);
                try {
                    var optionsImageWatermark = {
                        type: "image",
                        source: origin_path,
                        logo: logo_path, // This is optional if you have provided text Watermark
                        destination: copy_path,
                        position: {
                            logoX : logo_x,
                            logoY : logo_y,
                            logoWidth: logo_w,
                            logoHeight: logo_h
                        }
                    };
                    watermark.embed(optionsImageWatermark, function(status) {
                        //Do what you want to do here
                        console.log("!!!!!!!!!!+"+status);
                    });
                }
                catch (exception) {
                    console.log("exception!!!"+exception);
                }


                setTimeout(function() {
                    send_item={
                        image_id:image_id,
                        user_id:user_id
                    }
                    res.json(send_item);
                });
            });

        });
    };
    imageupload(req,res);

};
});

router.post('/updatetxid', function(req, res) {
            var user_id=req.session.user_id;
            var conn = mysql.createConnection(global.db_option);
            conn.connect(function (err) {
                if (err) throw err;

                var sql = `update USER set tx_id = ${req.body.tx_id} where user_id='${user_id}';`
                conn.query(sql, function(err,result3) {//hit + 1
                    if (err) throw err;
                    conn.end();
                    setTimeout(function() {
                        res.redirect("imageregistrationcomplete");
                    }, 1000);
                });
            });
        });

// router.post('/addblockchain', function(req, res){
//     tuna.add_tuna(req, res);
// };

router.get('/', function (req, res) {
    if (req.session && req.session.user_id){
        res.render('imageregistration');
    }
    else{
        res.render('index')
    }
});

router.get('/imageregistrationcomplete', function (req, res) {

    if (req.session && req.session.user_id){
        function select(req, res) {
            var user_id = req.session.user_id;
            var image_id;
            var conn = mysql.createConnection(global.db_option);

            conn.connect(function (err) {
                var sql = `select * from OWN_IMAGE where user_id = '${user_id}' order by own_seq desc limit 1;`;
                conn.query(sql, function (err, result) {
                    if (err) throw err;
                    var image_id = result[0].image_id;
                    var sql2 = `select * from IMAGE where image_id = '${image_id}';`;
                    conn.query(sql2, function (err, result2) {
                        if (err) throw err;
                        var origin_path = result2[0].origin_path;
                        var image_name = result2[0].image_name;
                        var filesize = result2[0].filesize;
                        var filetype = result2[0].filetype;
                        var timestamp = result2[0].timestamp;
                        var tx_id = result2[0].tx_id;
                        var aJson = new Object();
                        aJson.user_id = user_id;
                        aJson.image_id = image_id;
                        aJson.origin_path = origin_path;
                        aJson.image_name = image_name;
                        aJson.filesize = filesize;
                        aJson.filetype = filetype;
                        aJson.timestamp = timestamp;
                        aJson.tx_id = tx_id;
                        JSON.stringify(aJson);
                        conn.end();
                        res.render('imageregistrationcomplete', {data: aJson});
                    });
                });


            });
        };
        select(req,res);

    }
    else{
        res.render('index')
    }
});

module.exports = router;
