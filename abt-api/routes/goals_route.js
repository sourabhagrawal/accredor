var routeUtils = require('./route_utils.js');
var logger = require(LIB_DIR + 'log_factory').create("goals_route");
var goalsImpl = require(IMPLS_DIR + 'goals_impl');

var GoalsRoute = function(app){
	app.get('/goals/:id', function(req, res){
		routeUtils.getById(req, res, goalsImpl);
	});
	
	app.post('/goals', function(req, res){
		req.body = req.body || {};
		req.body.userId = req.body.userId || req.user.id;
		routeUtils.create(req, res, goalsImpl);
	});
	
	app.put('/goals/:id', function(req, res){
		routeUtils.update(req, res, goalsImpl);
	});
		
	app.get('/goals', function(req, res){
		req.query.q = req.query.q || '';
		req.query.q = req.query.q + '___userId:eq:' + req.user.id;
		routeUtils.search(req, res, goalsImpl);
	});
	
	app['delete']('/goals/:id', function(req, res){
		routeUtils.deleteById(req, res, goalsImpl);
	});
};

module.exports = function(app){
	return new GoalsRoute(app);
};