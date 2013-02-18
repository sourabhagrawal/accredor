exports.index = function(req, res){
   res.render('index');
};

exports.terms = function(req, res){
	res.render('static/terms');
};

exports.privacyPolicy = function(req, res){
	res.render('static/privacy-policy');
};

exports.faqs = function(req, res){
	res.render('static/faqs');
};

exports.abtesting = function(req, res){
	res.render('static/abtesting');
};

exports.gettingStarted = function(req, res){
	res.render('static/getting-started');
};