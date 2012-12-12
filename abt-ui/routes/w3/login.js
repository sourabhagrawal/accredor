var passport = require('passport');
var logger = require(LIB_DIR + 'log_factory').create("login");

exports.authenticate = function(req, res, next) {
	passport.authenticate('local', function(err, data, info) {
		if (err) { return next(err); }
		if(data && data.status && data.status.code == 1000) {
			req.logIn(data.data, function(err) {
				if (err) { return next(err); }
				res.cookie('isAuthenticated', 1);
				res.cookie('uid', req.user.id);
				res.cookie('uemail', req.user.email);
				res.send(data);
			});
		}else{
			res.send(500, data);
		}
	})(req, res, next);
};

exports.logout = function(req, res){
	res.clearCookie('isAuthenticated');
	res.clearCookie('uid');
	res.clearCookie('uemail');
	req.logOut();
	res.redirect('/');
};

exports.verify = function(req, res){
	res.render('verify');
};