var routeUtils = require('./route_utils.js');
var logger = require(LIB_DIR + 'log_factory').create("script_details_route");
var scriptDetailsImpl = require('../impls/script_details_impl');

var ScriptDetailsRoute = function(app){
	app.get('/script_details/:id', function(req, res){
		routeUtils.getById(req, res, scriptDetailsImpl);
	});
		
	app.get('/script_details', function(req, res){
		routeUtils.search(req, res, scriptDetailsImpl);
	});
	
	app.put('/script_details/:id', function(req, res){
		routeUtils.update(req, res, scriptDetailsImpl);
	});
};

module.exports = function(app){
	return new ScriptDetailsRoute(app);
};