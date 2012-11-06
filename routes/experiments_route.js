var routeUtils = require('./route_utils.js');
var logger = require('./../lib/log_factory').create("experiments_route");
var experimentsImpl = require('../impls/experiments_impl');

var ExperimentsRoute = function(app){
	app.get('/api/experiments/:id', function(req, res){
		routeUtils.getById(req, res, experimentsImpl);
	});
	
	app.post('/api/experiments/', function(req, res){
		routeUtils.create(req, res, experimentsImpl);
	});
	
	app.put('/api/experiments/:id', function(req, res){
		routeUtils.update(req, res, experimentsImpl);
	});
		
	app.get('/api/experiments/', function(req, res){
		routeUtils.search(req, res, experimentsImpl);
	});
};

module.exports = function(app){
	return new ExperimentsRoute(app);
};