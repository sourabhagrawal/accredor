
/**
 * Module dependencies.
 */
var express = require('express');
var http = require('http');
var path = require('path');
var request = require('request');
var CONFIG = require('config');
var log4js = require('log4js');
var _ = require('underscore');
var expressValidator = require('express-validator');

var constants = require('./lib/constants');
var logger = require(LIB_DIR + 'log_factory').create("app");

/**
 * Initialize App
 */
var app = express();

var port = process.env.PORT || 8081;

app.configure(function(){
  app.set('port', port);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {layout : false});
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(expressValidator);
  app.use(express.methodOverride());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(function(req, res, next) {
	  logger.info(req.method + " request on " + req.url);
	  if(req.headers.authorization && req.headers.authorization.search('Basic ') === 0) {
		// fetch login and password
		var authString = new Buffer(req.headers.authorization.split(' ')[1], 'base64').toString();
		var tokens = authString.split(':');
		if(tokens.length == 2){
			req.user = {
				id : tokens[0]
			};
			next();
			return;
		}
	  }
	  logger.info("Authorization Header required");
	  res.status(LOGIN_REQUIRED);
	  res.send();
  });
  
  //To access in JADE
  app.use(function(req, res, next) {
	  res.locals.app = app;
	  next();
  });
  
  app.use(app.router);
//  app.use(log4js.connectLogger(logger));
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
require('./routes')(app);


/**
 * Initialize the Server
 */
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

logger.info("Started with settings : " + JSON.stringify(app.settings));

require('./workers/email_job');
require('./workers/script_job');
