var routeUtils = require('./route_utils.js');
var logger = require(LIB_DIR + 'log_factory').create("variations_route");
var linksImpl = require('../impls/links_impl');

var LinksRoute = function(app){
	app.get('/api/links/:id', function(req, res){
		routeUtils.getById(req, res, linksImpl);
	});
	
	app.post('/api/links/', function(req, res){
		routeUtils.create(req, res, linksImpl);
	});
	
	app.put('/api/links/:id', function(req, res){
		routeUtils.update(req, res, linksImpl);
	});
		
	app.get('/api/links/', function(req, res){
		routeUtils.search(req, res, linksImpl);
	});
};

module.exports = function(app){
	return new LinksRoute(app);
};