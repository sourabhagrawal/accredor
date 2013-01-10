var routeUtils = require('./route_utils.js');
var logger = require(LIB_DIR + 'log_factory').create("experiment_visits_route");
var impl = require(IMPLS_DIR + 'experiment_visits_impl');

var ExperimentVisitsRoute = function(app){
	app.get('/experiment_visits/:id', function(req, res){
		routeUtils.getById(req, res, impl);
	});
	
	app.post('/experiment_visits', function(req, res){
		routeUtils.create(req, res, impl);
	});
	
	app.get('/experiment_visits', function(req, res){
		routeUtils.search(req, res, impl);
	});	
};

module.exports = function(app){
	return new ExperimentVisitsRoute(app);
};