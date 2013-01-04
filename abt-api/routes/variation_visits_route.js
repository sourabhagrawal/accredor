var routeUtils = require('./route_utils.js');
var logger = require(LIB_DIR + 'log_factory').create("variation_visits_route");
var impl = require(IMPLS_DIR + 'variation_visits_impl');

var VariationVisitsRoute = function(app){
	app.get('/variation_visits/:id', function(req, res){
		routeUtils.getById(req, res, impl);
	});
	
	app.post('/variation_visits', function(req, res){
		routeUtils.create(req, res, impl);
	});
	
	app.get('/variation_visits', function(req, res){
		routeUtils.search(req, res, impl);
	});	
};

module.exports = function(app){
	return new VariationVisitsRoute(app);
};