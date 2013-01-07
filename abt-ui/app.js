
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
var assetManager = require('connect-assetmanager');

require('./lib/constants');
var logger = require(LIB_DIR + 'log_factory').create("app");
var auth = require(LIB_DIR + 'auth');
var assetGroups = require(LIB_DIR + 'asset_groups');

/**
 * Initialize asset manager
 */
assetManagerGroups = assetGroups.getAll();
var assetsManagerMiddleware = assetManager(assetManagerGroups);

/**
 * Initialize App
 */
var app = express();

auth.init();

var port = process.env.PORT || 8080;

var apiProxy = httpProxy.createServer(function (req, res, proxy) {
	var user = req.user || {};
	var userId = user.id || 'dummy_login';
	req.headers['Authorization'] = "Basic " + new Buffer(userId + ':dummypass').toString('base64');
	proxy.proxyRequest(req, res, {
		host: 'localhost',
		port: 8081
	});
});

app.locals.domain = DOMAIN_HOST;
app.locals.domain_name = DOMAIN_NAME;
app.locals.support_id = DOMAIN_SUPPORT_ID;

var sessionParams = {};
if(IS_PROD){
	var RedisStore = require('connect-redis')(express);
	sessionParams = {
		secret : 'sutta',
		store: new RedisStore,
		cookie: {secure: false, maxAge: 7 * 24 * 60 * 60 * 1000}
	};
}else{
	sessionParams = {
		secret : 'sutta'
	};
}

app.configure(function(){
  app.set('port', port);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {layout : false});
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session(sessionParams));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(auth.filter());
  app.use(assetsManagerMiddleware);
  app.use(express.static(path.join(__dirname, 'public')));
  app.use('/api/', apiProxy);
  app.use(express.bodyParser());
  
  //To access in JADE
  app.use(function(req, res, next) {
	  res.locals.app = app;
	  next();
  });
  app.use(app.router);
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
app.get('/terms', baseRoute.terms);
app.get('/privacy-policy', baseRoute.privacyPolicy);
app.get('/faqs', baseRoute.faqs);
app.get('/what-is-ab-testing', baseRoute.abtesting);
app.get('/getting-started', baseRoute.gettingStarted);

app.get('/bench', benchRoute.index);
app.get('/fetch', benchRoute.fetch);
app.get('/dashboard', require('./routes/w3/dashboard').index);

app.get('/soon', function(req, res){
	res.render('soon');
});

app.post('/subscribe', function(req, res){
	logger.info("email : " + req.body.email);
	res.send();
});

/**
 * Initialize the Server
 */
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

logger.info("Started with settings : " + JSON.stringify(app.settings));