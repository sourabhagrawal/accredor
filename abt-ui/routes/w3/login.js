var logger = require(LIB_DIR + 'log_factory').create("login");

exports.authenticate = function(req, res) {
	res.redirect('/');
};

exports.logout = function(req, res){
	req.logOut();
	res.redirect('/');
};