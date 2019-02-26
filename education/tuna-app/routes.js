const express = require('express');
const router = express.Router();
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var mysql = require('mysql');
var request = require('request');
var tuna = require('./controller.js');

db_option = {
  host:'210.107.78.152',
  port: 3306,
  user:'popstore',
  password:'popstore',
  database:'popdb'
};

router.get('/', function (req, res) {
  if (req.session && req.session.user_id){
    res.render('imagehistory',{image_id : req.query.image_id});
  }
  else{
    res.render('index')
  }
});

router.get('/fabricinfo', function (req, res) {
  if (req.session && req.session.user_id){
    res.render('fabricinfo');
  }
  else{
    res.render('index')
  }
});

router.post('/getblocknumber', function (req, res) {
  tuna.getblocknumber(req, res);
});

router.post('/queryrecentblock', function (req, res) {
  tuna.queryrecentblock(req, res);
});

router.post('/add_tuna/', function (req, res) {
  tuna.add_tuna(req, res);
});

router.post('/trade_tuna/', function (req, res) {
  tuna.trade_tuna(req, res);
});

router.post('/inserttxid', function (req,res){
  txid = req.body.txid;
  image_id = req.body.image_id;
  console.log("txid!!!!!"+txid)
  console.log("image_id!!!!!"+image_id)

  var conn = mysql.createConnection(db_option);
  console.log("conn:!!!!"+conn)
  conn.connect(function (err) {
  var sql = `update IMAGE set tx_id = '${txid}' where image_id='${image_id}';`
  conn.query(sql, function(err,result3) {
      if (err) throw err;
      conn.end();
      res.send("success");
    });
  });
});

router.post('/get_tuna/:id', function(req, res){
  tuna.get_tuna(req, res);
});
// app.get('/add_tuna/:tuna', function(req, res){
//   tuna.add_tuna(req, res);
// });
router.post('/gethistory/', function(req, res){
  tuna.gethistory(req, res);
});
// app.get('/change_holder/:holder', function(req, res){
//   tuna.change_holder(req, res);
// });
// app.get('/delete_tuna/:id', function(req, res){
//   tuna.delete_tuna(req, res);
// });


module.exports = router;
