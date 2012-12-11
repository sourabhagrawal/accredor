var _ = require('underscore');
var passport = require('passport');
var request = require('request');
var LocalStrategy = require('passport-local').Strategy;
var logger = require(LIB_DIR + 'log_factory').create("app");

exports.init = function(){
	passport.use(new LocalStrategy(
		function(username, password, done) {
			console.log("Will authenticate here");
			
			request({
				uri : 'http://localhost:10001/users/authenticate',
				method : 'post',
				headers : {
					authorization : 'Basic dGVzdF91c2VyOnRlc3RfcGFzcwo='
				},
				json : {
					username : username,
					password : password
				}
			}, function (err, response, data) {
				if (err) { return done(err); }
				if (data && data.status && data.status.code == 1000){
					logger.debug("Login successfull : " + JSON.stringify(data));
					done(null, data.data);
				}else{
					logger.debug("Login failed : " + data.message);
					return done(null, false); 
				}
			});
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
		var whiteList = ['/api/users/signup', '/api/users/forgot'];
		var skipAuth = true;
		_.each(blackList, function(url){
			if(req.url.match(url)){
				skipAuth = false;
			}
		});
		_.each(whiteList, function(url){
			if(req.url.match(url)){
				skipAuth = true;
			}
		});
		if(skipAuth == true){
			logger.debug(req.url + " : skipped authentication");
		}
		if (skipAuth == true || req.isAuthenticated()){
			return next();
		}else{ //Say Unauthorized
			res.status(LOGIN_REQUIRED);
			res.send();
		}
	};
};