var routeUtils = require('./route_utils.js');
var logger = require(LIB_DIR + 'log_factory').create("experiments_route");
var experimentsImpl = require(IMPLS_DIR + 'experiments_impl');

var ExperimentsRoute = function(app){
	app.get('/experiments/:id', function(req, res){
		routeUtils.getById(req, res, experimentsImpl);
	});
	
	app.post('/experiments', function(req, res){
		routeUtils.create(req, res, experimentsImpl);
	});
	
	app.put('/experiments/:id', function(req, res){
		routeUtils.update(req, res, experimentsImpl);
	});
		
	app.get('/experiments', function(req, res){
		routeUtils.search(req, res, experimentsImpl);
	});
};

module.exports = function(app){
	return new ExperimentsRoute(app);
};