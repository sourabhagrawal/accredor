
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
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var constants = require('./lib/constants');
var logger = require(LIB_DIR + 'log_factory').create("app");

/**
 * Initialize App
 */
var app = express();

var port = process.env.PORT || 10000;

passport.use(new LocalStrategy(
	function(username, password, done) {
		console.log("Will authenticate here");
		/**
		 * TODO Write a real authenticate function
		 */
		done(null, {id : Math.floor((Math.random()*1000)+1)});
//		User.findOne({ username: username }, function (err, user) {
//			if (err) { return done(err); }
//			if (!user) { return done(null, false); }
//			if (!user.verifyPassword(password)) { return done(null, false); }
//			return done(null, user);
//		});
	}
));

//define REST proxy options based on logged in user
passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(obj, done) {
	done(null, obj);
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
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(function(req, res, next){
	  logger.debug(req.method + " request on " + req.url);
	  next();
  });
  app.use(function(req, res, next) {
	  var whiteList = ['^/$', '^/login', '^/api'];
	  var skipAuth = false;
	  _.each(whiteList, function(url){
		  if(req.url.match(url)){
			  skipAuth = true;
		  }
	  });
	  if (skipAuth == true || req.isAuthenticated())
		  return next();
	  else
		  res.redirect('/');
  });
  
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
app.post('/login', passport.authenticate('local', {failureRedirect: '/'}), loginRoute.authenticate);
app.get('/logout', loginRoute.logout);

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
