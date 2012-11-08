var routeUtils = require('./route_utils.js');
var logger = require(LIB_DIR + 'log_factory').create("variations_route");
var variationsImpl = require('../impls/variations_impl');

var VariationsRoute = function(app){
	app.get('/api/variations/:id', function(req, res){
		routeUtils.getById(req, res, variationsImpl);
	});
	
	app.post('/api/variations/', function(req, res){
		routeUtils.create(req, res, variationsImpl);
	});
	
	app.put('/api/variations/:id', function(req, res){
		routeUtils.update(req, res, variationsImpl);
	});
		
	app.get('/api/variations/', function(req, res){
		routeUtils.search(req, res, variationsImpl);
	});
};

module.exports = function(app){
	return new VariationsRoute(app);
};