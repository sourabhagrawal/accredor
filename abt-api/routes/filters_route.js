var routeUtils = require('./route_utils.js');
var logger = require(LIB_DIR + 'log_factory').create("filters_route");
var filtersImpl = require('../impls/filters_impl');

var FiltersRoute = function(app){
	app.get('/filters/:id', function(req, res){
		routeUtils.getById(req, res, filtersImpl);
	});
	
	app.post('/filters', function(req, res){
		req.body = req.body || {};
		req.body.userId = req.body.userId || req.user.id;
		routeUtils.create(req, res, filtersImpl);
	});
	
	app.put('/filters/:id', function(req, res){
		req.body = req.body || {};
		req.body.userId = req.body.userId || req.user.id;
		routeUtils.update(req, res, filtersImpl);
	});
	
	app['delete']('/filters/:id', function(req, res){
		req.body = req.body || {};
		req.body.userId = req.body.userId || req.user.id;
		routeUtils.deleteById(req, res, filtersImpl);
	});
		
	app.get('/filters', function(req, res){
		routeUtils.search(req, res, filtersImpl);
	});
};

module.exports = function(app){
	return new FiltersRoute(app);
};