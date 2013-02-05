
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
var urlParser = require('url');
var _ = require('underscore');

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

var port = CONFIG.nodes.ui.port || 8080;

var apiProxy = httpProxy.createServer(function (req, res, proxy) {
	var user = req.user || {};
	var userId = user.id || 'dummy_login';
	req.headers['Authorization'] = "Basic " + new Buffer(userId + ':dummypass').toString('base64');
	proxy.proxyRequest(req, res, {
		host: CONFIG.nodes.api.host,
		port: CONFIG.nodes.api.port
	});
});

var receiverProxy = httpProxy.createServer(function (req, res, proxy) {
	proxy.proxyRequest(req, res, {
		host: CONFIG.nodes.receiver.host,
		port: CONFIG.nodes.receiver.port
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
  
  app.use(function(req, res, next) {
	  if (req.url.match(/^\/scripts\//g)) {
		  req.url = '/scripts' + req.url;
	  }
	  next();
  });
  app.use('/api/', apiProxy);
  app.use('/scripts/', receiverProxy);
  app.use(express.bodyParser());
  
  app.use(function(req, res, next){
	  var referer = req.headers.referer;
	  
	  if(referer){
		  parsedReferer = urlParser.parse(referer, true);
		  if(parsedReferer.pathname && parsedReferer.pathname == '/fetch'){
			  // Fetch from the site
			  logger.info("fetching " + req.url + " from site");
			  var siteUrl = parsedReferer.query.url;
			  var siteUrlParts = urlParser.parse(siteUrl, true);
			  var siteBaseUrl = siteUrlParts.protocol + "//" + siteUrlParts.host;
			  
			  // TODO This might not be sufficient. Process the siteUrl more.
			  var requestUrl = urlParser.format(urlParser.parse(siteBaseUrl + req.url));
			  if(req.url.indexOf("/") != 0){
				  requestUrl = urlParser.format(urlParser.parse(siteUrl + req.url));
			  }
			  request(requestUrl, function (error, response, body) {
				  if (!error && response.statusCode == 200) {
					  _.each(response.headers, function(value, key){
						  res.setHeader(key, value);
					  });
					  res.send(body);
				  }else{
					  next();
				  };
			  });
		  }else{
			  next();
		  }
	  }else{
		  next();
	  }
  });
  
  //To access in JADE
  app.use(function(req, res, next) {
	  var isAuthenticated = req.user != undefined;
	 
	  res.locals.app = app;
	  res.locals.isAuthenticated = isAuthenticated;
	  if(isAuthenticated)
		  res.locals.user = req.user;
	  
	  next();
  });
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

/**
 * Initialize the Server
 */
http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

logger.info("Started with settings : " + JSON.stringify(app.settings));