var routeUtils = require('./route_utils.js');
var logger = require(LIB_DIR + 'log_factory').create("audits_route");
var auditsImpl = require('../impls/audits_impl');

var AuditsRoute = function(app){
	app.get('/audits/:id', function(req, res){
		routeUtils.getById(req, res, auditsImpl);
	});
	
	app.post('/audits', function(req, res){
		req.body = req.body || {};
		req.body.userId = req.body.userId || req.user.id;
		routeUtils.create(req, res, auditsImpl);
	});
	
	app.get('/audits', function(req, res){
		routeUtils.search(req, res, auditsImpl);
	});
};

module.exports = function(app){
	return new AuditsRoute(app);
};