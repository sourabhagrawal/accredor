var routeUtils = require('./route_utils.js');
var logger = require(LIB_DIR + 'log_factory').create("goal_visits_route");
var impl = require(IMPLS_DIR + 'goal_visits_impl');

var GoalVisitsRoute = function(app){
	app.get('/goal_visits/:id', function(req, res){
		routeUtils.getById(req, res, impl);
	});
	
	app.post('/goal_visits', function(req, res){
		routeUtils.create(req, res, impl);
	});
	
	app.get('/goal_visits', function(req, res){
		routeUtils.search(req, res, impl);
	});	
};

module.exports = function(app){
	return new GoalVisitsRoute(app);
};