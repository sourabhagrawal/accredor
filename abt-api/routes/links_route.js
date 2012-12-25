var routeUtils = require('./route_utils.js');
var logger = require(LIB_DIR + 'log_factory').create("variations_route");
var linksImpl = require('../impls/links_impl');

var LinksRoute = function(app){
	app.get('/links/:id', function(req, res){
		routeUtils.getById(req, res, linksImpl);
	});
	
	app.post('/links', function(req, res){
		req.body = req.body || {};
		req.body.userId = req.body.userId || req.user.id;
		routeUtils.create(req, res, linksImpl);
	});
	
	app.put('/links/:id', function(req, res){
		req.body = req.body || {};
		req.body.userId = req.body.userId || req.user.id;
		routeUtils.update(req, res, linksImpl);
	});
		
	app.get('/links', function(req, res){
		routeUtils.search(req, res, linksImpl);
	});
};

module.exports = function(app){
	return new LinksRoute(app);
};