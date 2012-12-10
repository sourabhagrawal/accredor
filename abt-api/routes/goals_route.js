var routeUtils = require('./route_utils.js');
var logger = require(LIB_DIR + 'log_factory').create("goals_route");
var goalsImpl = require(IMPLS_DIR + 'goals_impl');

var GoalsRoute = function(app){
	app.get('/goals/:id', function(req, res){
		routeUtils.getById(req, res, goalsImpl);
	});
	
	app.post('/goals', function(req, res){
		routeUtils.create(req, res, goalsImpl);
	});
	
	app.put('/goals/:id', function(req, res){
		routeUtils.update(req, res, goalsImpl);
	});
		
	app.get('/goals', function(req, res){
		routeUtils.search(req, res, goalsImpl);
	});
};

module.exports = function(app){
	return new GoalsRoute(app);
};