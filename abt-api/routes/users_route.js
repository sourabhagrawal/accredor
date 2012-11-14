var routeUtils = require('./route_utils.js');
var logger = require(LIB_DIR + 'log_factory').create("users_route");
var usersImpl = require(IMPLS_DIR + 'users_impl');

var UsersRoute = function(app){
	app.get('/users/:id', function(req, res){
		routeUtils.getById(req, res, usersImpl);
	});
	
	app.post('/users', function(req, res){
		routeUtils.create(req, res, usersImpl);
	});
	
	app.put('/users/:id', function(req, res){
		routeUtils.update(req, res, usersImpl);
	});
		
	app.get('/users', function(req, res){
		routeUtils.search(req, res, usersImpl);
	});
};

module.exports = function(app){
	return new UsersRoute(app);
};