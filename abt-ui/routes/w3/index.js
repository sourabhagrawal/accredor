exports.index = function(req, res){
   res.render('index');
};

exports.terms = function(req, res){
	res.render('terms');
};

exports.privacyPolicy = function(req, res){
	res.render('privacy-policy');
};

exports.faqs = function(req, res){
	res.render('faqs');
};

exports.abtesting = function(req, res){
	res.render('abtesting');
};

exports.gettingStarted = function(req, res){
	res.render('getting-started');
};