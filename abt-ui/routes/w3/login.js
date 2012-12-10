var logger = require(LIB_DIR + 'log_factory').create("login");

exports.authenticate = function(req, res) {
	res.cookie('uid', req.user.id);
	res.cookie('uemail', req.user.email);
	res.send();
};

exports.logout = function(req, res){
	req.logOut();
	res.redirect('/');
};