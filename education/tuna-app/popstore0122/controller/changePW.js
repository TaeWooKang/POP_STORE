var express = require('express');
var app = express();
var mysql = require('mysql');
var request = require('request');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var bodyParser = require('body-parser');
var alert = require('alert-node');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));
module.exports.changePW = function changePW(req,res){
    var user_id = req.session.user_id_findPW;
    var password = req.body.password;
    var conn = mysql.createConnection(global.db_option);
    conn.connect(function(err){
    if (err) throw err;
    console.log("connected.");
    var sql = `update USER 
    set password="${password}" where user_id=${user_id};`;
    conn.query(sql, function(err,result){
        if (err) throw err;        
        conn.end();
        req.session.destroy();
        
    });
});
res.redirect('changePWcomplete');
}