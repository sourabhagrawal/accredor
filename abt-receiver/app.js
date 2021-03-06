
/**
 * Module dependencies.
 */
var express = require('express');
var http = require('http');
var httpProxy = require('http-proxy');
var path = require('path');
var CONFIG = require('config');
var log4js = require('log4js');

var constants = require('./lib/constants');
var logger = require(LIB_DIR + 'log_factory').create("app");

/**
 * Initialize App
 */
var app = express();

var port = CONFIG.nodes.receiver.port || 8082;

app.configure(function(){
  app.set('port', port);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {layout : false});
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  
  app.use(function(req, res, next) {
	  if (req.url.match(/^\/scripts\//g)) {
		  res.setHeader("Cache-Control","max-age=60");
	  }
	  next();
  });
  app.use(express.static(path.join(__dirname, 'public')));
  
  // To access in JADE
  app.use(function(req, res, next) {
	  res.locals.app = app;
	  next();
  });
  app.use(app.router);
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
app.get('/variations/', require('./routes/variations_receiver').index);
app.get('/goals/', require('./routes/goals_receiver').index);

require('./subscribers/subscriber').init();


/**
 * Initialize the Server
 */
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

logger.info("Started with settings : " + JSON.stringify(app.settings));

require('./workers/script_file_job');
require('./workers/data_push_job');
