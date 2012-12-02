var routeUtils = require('./route_utils.js');
var logger = require(LIB_DIR + 'log_factory').create("emails_route");
var emailsImpl = require(IMPLS_DIR + 'emails_impl');

var EmailsRoute = function(app){
	app.get('/emails/:id', function(req, res){
		routeUtils.getById(req, res, emailsImpl);
	});
	
	app.post('/emails', function(req, res){
		routeUtils.create(req, res, emailsImpl);
	});
		
	app.get('/emails', function(req, res){
		routeUtils.search(req, res, emailsImpl);
	});
};

module.exports = function(app){
	return new EmailsRoute(app);
};