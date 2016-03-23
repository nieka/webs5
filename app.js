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
var morgan       = require('morgan');
var session      = require('express-session');

module.exports =function(config){

  if(config){
    console.log("set costum config");
    configDB = config;
  } else {
    configDB = require('./config/database.js');
  }

//uncommend als de auth word geimplementeerd
//require('./config/passport')(passport); // pass passport for configuration
// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

// Models
require('./models/user')(mongoose);
require('./models/race')(mongoose);
require('./models/wayPoint')(mongoose);

function handleError(req, res, statusCode, message){
  console.log();
  console.log('-------- Error handled --------');
  console.log('Request Params: ' + JSON.stringify(req.params));
  console.log('Request Body: ' + JSON.stringify(req.body));
  console.log('Response sent: Statuscode ' + statusCode + ', Message "' + message + '"');
  console.log('-------- /Error handled --------');
  res.status(statusCode);
  res.json(message);
};

// Routes
var routes = require('./routes/index');
var users = require('./routes/users')(mongoose, handleError);
var races = require('./routes/races')(mongoose, handleError);
var wayPoints = require('./routes/wayPoints')(mongoose, handleError);
// /Routes

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


app.use('/', routes);
app.use('/users', users);
app.use('/races', races);
app.use('/waypoints', wayPoints);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

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

// routes ======================================================================
//require('./routes/routes.js')(app); // load our routes and pass in our app and fully configured passport


   return app;
};

