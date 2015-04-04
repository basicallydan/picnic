var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var errorhandler = require('errorhandler');
var session = require('express-session');
var exphbs  = require('express-handlebars');
var uphook = require('up-hook');

var routes = require('./routes/index');
var users = require('./routes/users');
var albums = require('./routes/albums');
var mongoose = require('mongoose');

var User = require('./models/User');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var app = express();

// connect to the db
mongoose.connect('mongodb://localhost/projectx');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({
    defaultLayout: 'headerLayout',
    helpers: require("./lib/helpers.js").helpers
}));
app.set('view engine', 'handlebars');
// app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ secret: 'keyboard cat' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(uphook('/01a87ee2c9736961022f4af2af66dc55', { branch: 'master', cmd: "git pull" }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/users', users);
app.use('/api/albums', albums);

// Set up passport
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(errorhandler({ dumpExceptions: true, showStack: true }));
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
