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
var watermark = require('dynamic-watermark');
var sizeOf = require('image-size');

router.get('/', function(req, res, next) {
    var board_content = {};
    if (req.session && req.session.user_id) {
        console.log("borad loadind start")        
        function get_select(req, res) {
            var conn = mysql.createConnection(global.db_option);
            conn.connect(function (err) {
                var sql = `select * from BOARD`;
                conn.query(sql, function (err, result) {
                    if (err) {
                        console.log(err);
                    }
                    var sql2 = `select B.BOARD_NO,B.image_id,I.copy_path from BOARD B JOIN IMAGE I ON B.image_id = I.image_id`;
                    conn.query(sql2, function (err, result2) {
                        if (err) console.log(err);
                        var sql3 = `select board_no, tagged from BOARD_TAG;`;
                        conn.query(sql3, function(err,result3){ //load tag info
                            var sql4 = `select * from BOARD;`;
                            conn.query(sql4, function(err,result4){ //load length
                                res.render('market',{board_content : result, image:result2, board_tag:result3, item:false, board_length:result4});
                                conn.end();
                            });
                        });
                    });
                });
            });
        };
        function post_select(req, res) {
            var conn = mysql.createConnection(global.db_option);
            conn.connect(function (err) {
                var sql = `select * from BOARD where BOARD_NO in (select board_no from BOARD_TAG where tagged REGEXP '${req.query.item}');`;
                conn.query(sql, function (err, result) {
                    if (err) {
                        console.log(err);
                    }
                    var sql2 = `select B.BOARD_NO,B.image_id,I.copy_path from BOARD B JOIN IMAGE I ON B.image_id = I.image_id where B.BOARD_NO in (select board_no from BOARD_TAG where tagged REGEXP '${req.query.item}');`;
                    conn.query(sql2, function (err, result2) {
                        if (err) console.log(err);
                        var sql3 = `select board_no, tagged from BOARD_TAG;`
                        conn.query(sql3, function(err,result3){ //load tag info
                            var sql4 = `select * from BOARD;`;
                            conn.query(sql4, function(err,result4){ //load length
                                res.render('market',{board_content : result, image:result2, board_tag:result3, item:req.query.item, board_length:result4});
                                conn.end();
                            });
                        });
                    });
                });
            });
        };
        if(req.query.item){
            post_select(req,res);
        }
        else{
            get_select(req, res);
        }
    }
    else{
        res.render('index');
    }
});

router.post('/marketposting', function(req, res)
{
    console.log("image id find start")
    function select(req, res) {
        var user_id = req.session.user_id;

        var conn = mysql.createConnection(global.db_option);
        conn.connect(function (err) {
            var sql = `select O.image_id, O.user_id, I.origin_path, I.image_name, I.filesize, I.filetype, I.timestamp from OWN_IMAGE O JOIN IMAGE I ON O.image_id = I.image_id where O.user_id = '${user_id}'`;
            conn.query(sql, function (err, result) {
                if (err) throw err;
                res.json(result);
                console.log("image 불러오기 완료")
                conn.end();
            });
        });

    };
    select(req,res);
});

router.get('/marketposting', function(req, res, next) {
    if (req.session && req.session.user_id){
        res.render('marketposting');
    }
    else{
        res.render('index')
    }
});


router.post('/marketpost', function (req, res) {
    var data=-1;
    var subject = req.body.subject;
    var content = req.body.content;
    var image_id = req.body.image_id;
    var user_id = req.session.user_id;
    var user_nickname = req.session.user_nickname;
    var point = req.body.point;
    var tagged = req.body.tagged;
    var tag = tagged.replace(/#/gi, "");
    var tag = tag.split(" ");
    if(point > 100000000){
        data = -3;
        res.json(data);
    }else{
        var conn = mysql.createConnection(global.db_option);
        conn.connect(function(err){
            if (err) throw err;
            var sql1 = `select image_id from BOARD where image_id = '${image_id}' AND blind = 'N';`;
            conn.query(sql1, function(err,result){
                if(err){
                    res.json(data);
                }else if(result.length > 0){
                    data = -2;
                    res.json(data);
                }else{
                    var sql2 = `insert into BOARD (subject, content, image_id, user_nickname, user_id,price, timestamp)
                                values ('${subject}','${content}','${image_id}','${user_nickname}', '${user_id}','${point}',now())`;
                    conn.query(sql2, function(err,result){
                        if (err) throw err;
                        console.log("글 등록 성공");
                        data = result['insertId'];
                        if(data == result['insertId']){
                            for(i = 1; i < tag.length; i++){
                                input_tag = tag[i];
                                var sql = `insert into BOARD_TAG (board_no, tagged) values ('${data}','${input_tag}')`;
                                conn.query(sql, function(err,result){
                                    if (err) throw err;
                                })
                            }
                        }
                        conn.end();
                        res.json(data);
                    });
                }
            });
        });
    }
});

router.get('/marketpostcontent/:board_no', function (req, res) {
    let board_no = req.params.board_no;
    var page_data = {};
    var conn = mysql.createConnection(global.db_option);

    conn.connect(function(err){
        if (err){
            throw error;
        }
        var sql = `select * from BOARD where BOARD_NO='${board_no}';`
        conn.query(sql, function(err,result){
            if (err){
                throw error;
            }
            else{
                board_content = result[0];
                if(!board_content){
                    res.send('<script type="text/javascript">alert("해당 페이지를 찾을 수 없습니다.");\n' +
                        'window.location = "/market";</script>');
                    return false;
                }
                image_id = board_content.image_id;

                var sql2 = `select * from IMAGE where image_id='${image_id}';`;
                conn.query(sql2, function(err,result2){//load image info
                    image_content = result2[0];
                    var sql3 = `update BOARD set hit = hit+1 where BOARD_NO='${board_no}';`;
                    conn.query(sql3, function(err,result3){//hit + 1
                        var sql4 = `select * from BOARD_TAG where board_no='${board_no}';`;
                        conn.query(sql4, function(err,board_tag){ //load tag info
                            var sql5 = `SELECT COMMENT.*, USER.profile_img FROM COMMENT JOIN USER ON COMMENT.user_nickname = USER.user_nickname where board_no=${board_no};`;
                            conn.query(sql5, function(err,board_comment){ //load comment info
                                res.render('marketpostcontent',{board_content : board_content, image_content:image_content, board_tag:board_tag, board_comment:board_comment,now_user:req.session.user_id});
                                conn.end();
                            });
                        });
                    });
                });
            };
        });
    });
});


router.post('/marketpostcontent/:board_no', function (req, res) {
    console.log("image id find start")
    let board_no = req.params.board_no;
    function select(req, res) {
        var conn = mysql.createConnection(global.db_option);
        conn.connect(function (err) {
            var sql = `select image_id from BOARD where BOARD_NO='${board_no}';`
            conn.query(sql, function (err, result) {
                if (err) throw err;
                var imageid = result[0].image_id;

                var sql2 = `select copy_path from IMAGE where image_id = '${imageid}';`;
                conn.query(sql2, function (err, result2) {
                    if (err) throw err;
                    var copy_path = result2[0].copy_path;
                    res.json(result2);
                });
                conn.end();
            });
        });
    };
    select(req,res);
});

router.post('/add_comment', function (req, res) {
    data = -1;
    let board_no = req.body.board_no;
    let user_nickname = req.session.user_nickname;
    let comment_content = req.body.comment_content;
    var conn = mysql.createConnection(global.db_option);
    conn.connect(function (err) {
        var sql = `insert into COMMENT (board_no, user_nickname, comment_content, timestamp)
            values ('${board_no}','${user_nickname}','${comment_content}',now())`;
        conn.query(sql, function (err, result) {
            if (err){
                console.log(err);
                res.json(data);
            }
            else{
                data = 1;
                res.json(data);
                conn.end();
            }
        });
    });
});


router.get('/marketpostedit/:board_no', function (req, res) {
    let board_no = req.params.board_no;
    var page_data = {};
    var conn = mysql.createConnection(global.db_option);
    var user_nickname = req.session.user_nickname;
    conn.connect(function(err){
        if (err) throw error;
        var sql = `select * from BOARD where BOARD_NO='${board_no}';`
        conn.query(sql, function(err,result){
            if (err) throw error;
            else{
                board_content = result[0];
                own_user_nickname = result[0].user_nickname;
                board_blind = result[0].blind;
                if(!board_content){
                    res.send('<script type="text/javascript">alert("해당 페이지를 찾을 수 없습니다.");\n' +
                        'window.location = "/market";</script>');
                    return false;
                }
                if(board_blind != "N"){
                    res.send('<script type="text/javascript">alert("수정할 수 없는 글입니다.");\n' +
                    'window.location = "/market";</script>');
                    return false;
                }
                if(own_user_nickname != user_nickname){
                    res.send('<script type="text/javascript">alert("자신이 작성한 글이 아닙니다.");\n' +
                    'window.location = "/market";</script>');
                    return false;
                }

                image_id = board_content.image_id;

                var sql2 = `select * from IMAGE where image_id='${image_id}';`
                conn.query(sql2, function(err,result2){//load image info
                    image_content = result2[0];
                    var sql3 = `update BOARD set hit = hit+1 where BOARD_NO='${board_no}';`
                    conn.query(sql3, function(err,result3){//hit + 1
                        var sql4 = `select * from BOARD_TAG where board_no='${board_no}';`
                        conn.query(sql4, function(err,board_tag){ //load tag info
                            var sql5 = `select * from COMMENT where board_no='${board_no}';`
                            conn.query(sql5, function(err,board_comment){ //load comment info
                                res.render('marketpostedit',{board_content : board_content, image_content:image_content, board_tag:board_tag, board_comment:board_comment});
                                conn.end();
                            });
                        });
                    });
                });
            };
        });
    });
});

router.post('/marketpostedit/:board_no', function (req, res) {
    let board_no = req.params.board_no;
    var subject = req.body.subject;
    var content = req.body.content;
    var point = req.body.point;
    if(point > 1000000){
        data = -3;
        res.json(data);
        return false;
    }
    var tagged = req.body.tagged;
    var tag = tagged.replace(/#/gi, "");
    var tag = tag.split(" ");
    var conn = mysql.createConnection(global.db_option);
    conn.connect(function (err) {
        if (err) throw err;
        else{
        var sql = `update BOARD set subject='${subject}', content='${content}', price='${point}', timestamp=now() where BOARD_NO='${board_no}';`;
        conn.query(sql, function (err, result) {
            if (err) throw err;
            else{
                var sql2 = `delete FROM BOARD_TAG where BOARD_NO='${board_no}'`;
                conn.query(sql2, function (err, result2) {
                    if (err) throw err;
                    else{
                        for (i = 1; i < tag.length; i++) {
                            input_tag = tag[i];
                            var sql3 = `insert into BOARD_TAG (board_no, tagged) values ('${board_no}','${input_tag}');`;
                            conn.query(sql3, function (err, result3) {
                                if (err) throw err;
                            });
                        };
                        data=board_no;
                        res.json(data);
                        conn.end();
                    }
                });
            }
        });
        }
    });

});

router.post('/del_comment', function (req, res) {
    data = -1;
    let user_nickname = req.session.user_nickname;
    let board_no = req.body.board_no;
    let own_user_nickname = req.body.own_user_nickname;
    let board_comment_key = req.body.board_comment_key
    if(user_nickname != own_user_nickname){
        data = 0;
        res.json(data);
    }
    else{
        var conn = mysql.createConnection(global.db_option);
        conn.connect(function (err) {
            var sql = `delete from COMMENT where comment_key='${board_comment_key}';`;
            conn.query(sql, function (err, result) {
                if (err){
                    console.log(err);
                    res.json(data);
                }
                else{
                    data = 1;
                    res.json(data);
                    conn.end();
                }
            });
        })};
});

router.post('/edit_comment', function (req, res) {
    data = -1;
    let user_nickname = req.session.user_nickname;
    let board_no = req.body.board_no;
    let own_user_nickname = req.body.own_user_nickname;
    let board_comment_key = req.body.board_comment_key;
    let board_comment_content = req.body.edit_comment_content;
    if(user_nickname != own_user_nickname){
        data = 0;
        res.json(data);
    }
    else{
        var conn = mysql.createConnection(global.db_option);
        conn.connect(function (err) {
            var sql = `update COMMENT set comment_content="${board_comment_content}", timestamp=now() where comment_key='${board_comment_key}';`;
            conn.query(sql, function (err, result) {
                if (err){
                    console.log(err);
                    res.json(data);
                }
                else{
                    data = 1;
                    res.json(data);
                    conn.end();
                }
            });
        })};
});

router.post('/edit_comment_confirm', function (req, res) {
    data = -1;
    let user_nickname = req.session.user_nickname;
    let own_user_nickname = req.body.own_user_nickname;
    let board_comment_key = req.body.board_comment_key;
    if(user_nickname != own_user_nickname){
        data = 0;
        res.json(data);
    }
    else{
        data = 1;
        res.json(data);
        conn.end();
    }
});


router.get('/marketpurchasecomplete', function(req, res, next) {
    if (req.session && req.session.user_id){
        res.render('marketpurchasecomplete');
    }
    else{
        res.render('index')
    }
});

router.post('/marketpurchasecomplete', function(req, res){
    function select(req, res) {
        var user_id = req.session.user_id;
        var image_id;
        var conn = mysql.createConnection(global.db_option);

        conn.connect(function (err) {
            var sql = `select * from OWN_IMAGE where user_id = '${user_id}' order by timestamp desc limit 1;`;
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
                    var aJson = new Object();
                    aJson.user_id = user_id;
                    aJson.image_id = image_id;
                    aJson.origin_path = origin_path;
                    aJson.image_name = image_name;
                    aJson.filesize = filesize;
                    aJson.filetype = filetype;
                    aJson.timestamp = timestamp;
                    JSON.stringify(aJson);

                    conn.end();
                    res.json(aJson);
                });
            });


        });
    };
    select(req,res);
});

router.post('/cart', function (req, res){
    var data = -1;
    var board = req.body.board;
    var user_id = req.session.user_id;
    var board_point = req.body.point;
    var image_id = req.body.image_id;
    var seller_id = req.body.seller_id;
    var blind = req.body.blind;
    if(blind == "Y"){
        data = 4;
        res.json(data);
        return false;
    }
    else if(!user_id){
        data = 2;
        res.json(data);
        return false;
    }
    else if(user_id == seller_id){
        data = 3;
        res.json(data);
        return false;
    }else if(board_point > 1000000){
        data = -3;
        res.json(data);
        return false;
    }
    else{
        var conn = mysql.createConnection(global.db_option);
        conn.connect(function(err){
            if (err){
                console.log(err);
                res.json(data);
                return false;
            }
            else{
                var sql0 = `select * from BOARD where BOARD_NO = '${board}';`;
                conn.query(sql0, function(err, result0){
                    if (err){
                        conn.end();
                        res.send(`<script> alert("${err} 에러 발생. 다시 시도해 주세요."); location.href="/market/marketpostcontent/${board}" </script>`);
                    }else if(result0[0].blind == "Y"){
                        data = 4;
                        conn.end();
                        res.json(data);
                        return false;
                    }else{
                        conn.beginTransaction(function(err){
                            if (err){
                                conn.end();
                                res.json(data);
                                return false;
                            }
                            var sql = `update USER set point = point - ${board_point} where user_id = '${user_id}';`;
                            conn.query(sql, function(err, result){
                                if (err){
                                    console.log(err);
                                    conn.rollback(function (){
                                        console.error('rollback error');
                                        data=1;
                                        conn.end();
                                        res.json(data);
                                        return false;
                                    });
                                }
                                var sql1 = `update USER set point = point + ${board_point} where user_id = '${seller_id}';`;
                                conn.query(sql1, function(err, result){
                                    if (err){
                                        console.log(err);
                                        conn.rollback(function (){
                                            console.error('rollback error');
                                            return false;
                                        });
                                    }
                                    var sql2 = `update OWN_IMAGE set user_id = '${user_id}', timestamp=now() where image_id = '${image_id}';`;
                                    conn.query(sql2, function(err, result){
                                        if (err){
                                            console.log(err);
                                            conn.rollback(function (){
                                                console.error('rollback error');
                                                return false;
                                            });
                                        }
                                        var sql3 = `update BOARD set blind = 'Y' where BOARD_NO = '${board}';`;
                                        conn.query(sql3, function(err, result){
                                            if (err){
                                                console.log(err);
                                                conn.rollback(function (){
                                                    console.error('rollback error');
                                                    return false;
                                                });
                                            }
                                            else{
                                                var sql4 = `select * from IMAGE where image_id = '${image_id}';`;
                                                conn.query(sql4, function(err, result){
                                                    if (err){
                                                        console.log(err);
                                                        conn.rollback(function (){
                                                            console.error('rollback error');
                                                            return false;
                                                        });
                                                    }
                                                    else{
                                                        var origin_path = result[0].origin_path;
                                                        var copy_path = result[0].copy_path;
                                                        var dimensions = sizeOf(origin_path);
                                                        var logo_x = dimensions.width/12;
                                                        var logo_y = dimensions.height/10;
                                                        var logo_w = (dimensions.width/10);
                                                        var logo_h = (logo_w/5*2);
                                                        try {
                                                            var optionsTextWatermark = {
                                                                type: "text",
                                                                text: user_id, // This is optional if you have provided text Watermark
                                                                destination: copy_path,
                                                                source: origin_path,
                                                                position: {
                                                                    logoX : logo_x,
                                                                    logoY : logo_y,
                                                                    logoHeight: logo_h,
                                                                    logoWidth: logo_w
                                                                },
                                                                textOption: {
                                                                    fontSize: logo_w, //In px default : 20
                                                                    color: '#AAF122' // Text color in hex default: #000000
                                                                }
                                                            };
                                                            watermark.embed(optionsTextWatermark, function(status) {
                                                                //Do what you want to do here
                                                                console.log("!!!!!!!!!!+"+status);
                                                            });
                                                        }
                                                        catch (exception) {
                                                            console.log("exception!!!"+exception);
                                                        }
                                                        conn.commit(function (){
                                                            console.log("이미지 구매 성공");
                                                            data = 0;
                                                            conn.end();
                                                            res.json(data);
                                                    });
                                                    }
                                                });
                                            }
                                        });
                                    });
                                });
                            });
                        })
                    }
                })
            }
        })
    }
});

router.post('/buyable', function (req, res){
    data = -1;
    var board = req.body.board;
    var user_id = req.session.user_id;
    var board_point = req.body.point;
    var image_id = req.body.image_id;
    var seller_id = req.body.seller_id;
    var blind = req.body.blind;
    if(!user_id){
        data = 0;
        res.json(data);
    }
    else{
        var conn = mysql.createConnection(global.db_option);
        conn.connect(function(err){
            if (err){
                console.log(err);
                res.json(data);
            }
            else{
                if (err){
                    throw err;
                }
                var sql = `select * from USER where user_id = '${user_id}';`;
                conn.query(sql, function(err, result){
                    if (err){
                        console.log(err);
                    }else{
                        if(result[0].point < board_point){
                            data = 1;
                            return res.json(data);
                        }else{
                            data = 2;
                            return res.json(data);
                        }
                    }
                });
            }
        })
    }
});

module.exports = router;
