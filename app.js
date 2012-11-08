
/**
 * Module dependencies.
 */
var express = require('express');
var http = require('http');
var path = require('path');
var request = require('request');
var CONFIG = require('config');
var log4js = require('log4js');
var constants = require('./lib/constants');

var logger = require(LIB_DIR + 'log_factory').create("app");

/**
 * Initialize App
 */
var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 10000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {layout : false});
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('sutta'));
  app.use(express.session());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(function(req, res, next){
	  logger.debug(req.method + " request on " + req.url);
	  next();
  });
  app.use(app.router);
//  app.use(log4js.connectLogger(logger));
  app.use(function(req, res, next){
		request(req.session.url + req.url, function (error, response, body) {
			  if (!error && response.statusCode == 200) {
				  var type = require('mime').lookup(req.session.url + req.url);
				  //console.log(req.url + " : " + type);
				  res.header("Content-Type", type);
				  res.send(body);
			  }else{
//				  logger.error(error);
				  next();
			  }
			});
	});
  app.use(function(err, req, res, next) {
	  // only handle `next(err)` calls
	  console.log("Error occurred");
	  logger.error(err);
	  next();
  });
});

/**
 * Routes
 */
var baseRoute = require('./routes/w3/index');
var benchRoute = require('./routes/w3/bench');

app.get('/', baseRoute.index);
app.get('/bench', benchRoute.index);
app.get('/fetch', benchRoute.fetch);


require('./routes')(app);


/**
 * Initialize the Server
 */
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
