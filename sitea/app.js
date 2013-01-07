
/**
 * Module dependencies.
 */
var express = require('express');
var http = require('http');
var path = require('path');

var app = express();

var port = process.env.PORT || 10010;

app.configure(function(){
  app.set('port', port);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {layout : false});
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.bodyParser());
  app.use(app.router);
  app.use(function(err, req, res, next) {
	  // only handle `next(err)` calls
	  logger.error(err);
	  next();
  });
});

/**
 * Routes
 */
var baseRoute = require('./routes/w3/index');

app.get('/', baseRoute.index);
app.get('/index', baseRoute.index);
app.get('/index2', baseRoute.index2);
app.get('/goal1', baseRoute.goal1);

/**
 * Initialize the Server
 */
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
