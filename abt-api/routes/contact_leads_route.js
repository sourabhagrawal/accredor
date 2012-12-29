var routeUtils = require('./route_utils.js');
var logger = require(LIB_DIR + 'log_factory').create("contact_leads_route");
var contactLeadsImpl = require(IMPLS_DIR + 'contact_leads_impl');

var ContactLeadsRoute = function(app){
	app.get('/contact_leads/:id', function(req, res){
		routeUtils.getById(req, res, contactLeadsImpl);
	});
	
	app.post('/contact_leads', function(req, res){
		routeUtils.create(req, res, contactLeadsImpl);
	});
	
	app.get('/contact_leads', function(req, res){
		routeUtils.search(req, res, contactLeadsImpl);
	});	
};

module.exports = function(app){
	return new ContactLeadsRoute(app);
};