var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

//Added scripts
app.use('/scripts', express.static(__dirname + '/node_modules/angular/'));
app.use('/scripts', express.static(__dirname + '/node_modules/angular-route/'));
app.use('/scripts', express.static(__dirname + '/node_modules/angular-material/'));
app.use('/scripts', express.static(__dirname + '/node_modules/angular-aria/'));
app.use('/scripts', express.static(__dirname + '/node_modules/angular-animate/'));
app.use('/scripts', express.static(__dirname + '/node_modules/angular-messages/'));
app.use('/scripts', express.static(__dirname + '/node_modules/font-awesome/'));
app.use('/scripts', express.static(__dirname + '/node_modules/isteven-angular-multiselect/'));

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

//Server setup
app.set('port', process.env.PORT || 8080);
var server = app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + server.address().port);
});

module.exports = app;
