var express = require('express');
var app = express();
var mysql = require('mysql');
var request = require('request');
var bodyParser = require('body-parser');
var router = express.Router();
var alert = require('alert-node');
var changePW = require('../controller/changePW');

/* GET home page. */
router.get('/', function (req, res) {
    if (req.session && req.session.user_id){
        res.redirect('/main');
    }
    else{
        res.render('index')
    }
});



router.get('/index', function (req, res) {
    if (req.session && req.session.user_id){
        res.render('main');
    }
    else{
        res.render('index')
    }
});


router.get('/logout', function (req,res){
    console.log(`${req.session.user_id}의 logout`);
    req.session.destroy();
    res.redirect('/')
})

router.get('/signupcomplete', function (req, res) {
    res.render('signupcomplete');
});


router.get('/changePW', function (req, res) {
    if (req.session && req.session.user_id_findPW){
        res.render('changePW');
    }
    else{
        res.render('changePW');
    }
});

router.post('/changePW', function (req, res) {
    changePW.changePW(req,res);
});

router.get('/changePWcomplete', function (req, res) {
    res.render('changePWcomplete');
});


// router.get('/imagehistory', function (req, res) {
//     res.render('imagehistory');
// });


router.get('/mypageimageblog', function (req, res) {
    res.render('mypageimageblog');
});

module.exports = router;