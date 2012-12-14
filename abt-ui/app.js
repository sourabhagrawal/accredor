
/**
 * Module dependencies.
 */
var express = require('express');
var http = require('http');
var httpProxy = require('http-proxy');
var path = require('path');
var request = require('request');
var CONFIG = require('config');
var log4js = require('log4js');
var passport = require('passport');

require('./lib/constants');
var logger = require(LIB_DIR + 'log_factory').create("app");
var auth = require(LIB_DIR + 'auth');

/**
 * Initialize App
 */
var app = express();

auth.init();

var port = process.env.PORT || 10000;

var apiProxy = httpProxy.createServer(function (req, res, proxy) {
	var user = req.user || {};
	var userId = user.id || 'dummy_login';
	req.headers['Authorization'] = "Basic " + new Buffer(userId + ':dummypass').toString('base64');
	proxy.proxyRequest(req, res, {
		host: 'localhost',
		port: 10001
	});
});

app.locals.domain = DOMAIN_HOST;
app.locals.domain_name = DOMAIN_NAME;
app.locals.support_id = DOMAIN_SUPPORT_ID;

app.configure(function(){
  app.set('port', port);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {layout : false});
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({secret : 'sutta'}));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(auth.filter());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use('/api/', apiProxy);
  app.use(express.bodyParser());
  app.use(app.router);
//  app.use(log4js.connectLogger(logger));
  app.use(function(req, res, next){
	  request(req.session.url + req.url, function (error, response, body) {
		  if (!error && response.statusCode == 200) {
			  var type = require('mime').lookup(req.session.url + req.url);
			  res.header("Content-Type", type);
			  res.send(body);
		  }else{
			  next();
		  };
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
var loginRoute = require('./routes/w3/login');

app.get('/login', loginRoute.index);
app.post('/login', loginRoute.authenticate);
app.get('/logout', loginRoute.logout);
app.get('/verify', loginRoute.verify);
app.get('/recover', loginRoute.recover);

app.get('/', baseRoute.index);
app.get('/bench', benchRoute.index);
app.get('/fetch', benchRoute.fetch);
app.get('/create', require('./routes/w3/create').index);

/**
 * Initialize the Server
 */
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
