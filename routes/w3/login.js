var logger = require(LIB_DIR + 'log_factory').create("login");

exports.index = function(req, res){
	if(req.user != null){
		logger.debug("Already logged in : " + JSON.stringify(req.user));
		res.redirect('/');
	}else
		res.render('login_page');
};

exports.authenticate = function(req, res) {
	res.redirect('/');
};

exports.logout = function(req, res){
	req.logOut();
	res.redirect('/');
};