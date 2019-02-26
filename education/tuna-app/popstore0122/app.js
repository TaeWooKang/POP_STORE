var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var indexRouter = require('./routes/index');
var uploads = require('./routes/upload');
var mains = require('./routes/main')
var mygallerys = require('./routes/mygallery');
var signins = require('./routes/signin');
var signups = require('./routes/signup');
var profiles = require('./routes/profile');
var markets = require('./routes/market');

var fabrics = require('../tuna-app/routes')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

global.db_option = {
  host:'210.107.78.152',
  port: 3306,
  user:'popstore',
  password:'popstore',
  database:'popdb'
};
// var sessionStore = new MySQLStore(global.db_option);

app.use(session({
  key: 'login',
  secret: '1q2w3e4r',
  // store: sessionStore,
  resave: false,
  saveUninitialized: false
}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/photo', express.static('photo'));
app.use('/photocopy', express.static('photocopy'));
app.use(express.static('./static'));
app.use('/node_modules', express.static(path.join(__dirname, '/node_modules')));
// app.use(express.static('./upload'));
app.use('/', indexRouter);
app.use('/upload', uploads);
app.use('/mypage', mygallerys);
app.use('/main', mains);
app.use('/login', signins);
app.use('/signup', signups);
app.use('/profile', profiles);
app.use('/marketposting', mygallerys);
app.use('/marketpostedit', markets);
app.use('/market',markets);
app.use('/imagehistory', fabrics);
app.use('/imageregistration', fabrics);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
