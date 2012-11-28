
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

var port = process.env.PORT || 10002;

var apiProxy = httpProxy.createServer(function (req, res, proxy) {
	var user = req.user || {};
	var userId = user.id || 'dummy_login';
	req.headers['Authorization'] = "Basic " + new Buffer(userId + ':dummypass').toString('base64');
	
	proxy.proxyRequest(req, res, {
		host: 'localhost',
		port: 10001
	});
});

app.configure(function(){
  app.set('port', port);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {layout : false});
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('sutta'));
  app.use(express.session({secret : 'sutta'}));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use('/api/', apiProxy);
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
app.get('/variations/', require('./routes/variations_receiver').index);
app.get('/goals/', require('./routes/goals_receiver').index);

require('./subscribers/subscriber').init();


/**
 * Initialize the Server
 */
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
