var _ = require('underscore');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var logger = require(LIB_DIR + 'log_factory').create("app");

exports.init = function(){
	passport.use(new LocalStrategy(
		function(username, password, done) {
			console.log("Will authenticate here");
			/**
			 * TODO Write a real authenticate function
			 */
			done(null, {id : Math.floor((Math.random()*1000)+1)});
//			done(null, false);
//				User.findOne({ username: username }, function (err, user) {
//					if (err) { return done(err); }
//					if (!user) { return done(null, false); }
//					if (!user.verifyPassword(password)) { return done(null, false); }
//					return done(null, user);
//				});
		}
	));

	//define REST proxy options based on logged in user
	passport.serializeUser(function(user, done) {
		done(null, user);
	});

	passport.deserializeUser(function(obj, done) {
		done(null, obj);
	});
};

exports.filter = function(req, res, next){
	return function(req, res, next) {
		logger.debug(req.method + " request on " + req.url);
		var blackList = ['^/api/'];
		var skipAuth = true;
		_.each(blackList, function(url){
			if(req.url.match(url)){
				skipAuth = false;
			}
		});
		if (skipAuth == true || req.isAuthenticated())
			return next();
		else{ //Say Unauthorized
			res.status(LOGIN_REQUIRED);
			res.send();
		}
	};
};