var logger = require(LIB_DIR + 'log_factory').create("login");

exports.authenticate = function(req, res) {
	res.cookie('isAuthenticated', 1);
	res.cookie('uid', req.user.id);
	res.cookie('uemail', req.user.email);
	res.send();
};

exports.logout = function(req, res){
	res.clearCookie('isAuthenticated');
	res.clearCookie('uid');
	res.clearCookie('uemail');
	req.logOut();
	res.redirect('/');
};