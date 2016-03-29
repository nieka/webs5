var configDB;
var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');
var morgan   = require('morgan');
var session  = require('express-session');
module.exports =function(config){

  if(config){
    console.log("set costum config");
    configDB = config;
  } else {
    configDB = require('./config/database.js');
  }

  //uncommend als de auth word geimplementeerd
  require('./config/passport')(passport); // pass passport for configuration
  // configuration ===============================================================
  console.log("mongoose.connection.readyState " + mongoose.connection.readyState);
  if(mongoose.connection.readyState === 0){
    mongoose.connect(configDB.url);
  }
  // Models
  require('./models/user');
  require('./models/race');
  require('./models/wayPoint');

  var app = express();

  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');

  // uncomment after placing your favicon in /public
  //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));

  // required for passport
  app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
  app.use(passport.initialize());
  app.use(passport.session()); // persistent login sessions
  app.use(flash()); // use connect-flash for flash messages stored in session

  // Route
  var routes = require('./routes/routes');
  var users = require('./routes/users');
  var races = require('./routes/races');
  var wayPoints = require('./routes/wayPoints');

// route middleware to make sure a user is logged in
  function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
      return next();

    // if they aren't redirect them to the home page
    console.log("niet ingelogd");
    if(req.headers.accept.indexOf("application/json") > -1){
      res.json({msg : "U moet ingelogd zijn om deze actie te doen"});
    } else {
      res.redirect('/');
    }
  }

  app.use('/', routes);
  app.use('/users',isLoggedIn, users);
  app.use('/races',isLoggedIn, races);
  app.use('/waypoints',isLoggedIn, wayPoints);

  //Dit is mijn middelware voor error handeling vanuit de routes
  app.use(function(err, req, res, next) {
    if(!err){ next(); }
    res.status = 403;
    var msg = {
      msg: "Oops somethign went wrong",
      err: err
    };
    res.json(msg);
  });

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // development error handler
  // will print stacktrace
  if (app.get('env') === 'development') {
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
  return app;
};