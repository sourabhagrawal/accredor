var routeUtils = require('./route_utils.js');
var logger = require(LIB_DIR + 'log_factory').create("users_route");
var usersImpl = require(IMPLS_DIR + 'users_impl');

var UsersRoute = function(app){
	app.get('/users/verify', function(req, res){
		usersImpl.verify(req.query.token, function(err, data){
			if(err == undefined){
				routeUtils.respond(req, res, data);
			}else{
				routeUtils.respond(req, res, err);
			}
		});
	});
	
	app.get('/users/validate_token', function(req, res){
		usersImpl.validateToken(req.query.token, function(err, data){
			if(err == undefined){
				routeUtils.respond(req, res, data);
			}else{
				routeUtils.respond(req, res, err);
			}
		});
	});
	
	app.get('/users/:id', function(req, res){
		routeUtils.getById(req, res, usersImpl);
	});
	
	app.post('/users', function(req, res){
		routeUtils.create(req, res, usersImpl);
	});
	
	app.put('/users/update_password', function(req, res){
		usersImpl.updatePassword(req.body.email, req.body.password, function(err, data){
			if(err == undefined){
				routeUtils.respond(req, res, data);
			}else{
				routeUtils.respond(req, res, err);
			}
		});
	});
	
	app.put('/users/:id', function(req, res){
		routeUtils.update(req, res, usersImpl);
	});
		
	app.get('/users', function(req, res){
		routeUtils.search(req, res, usersImpl);
	});
	
	app.post('/users/authenticate', function(req, res){
		usersImpl.authenticate(req.body.username, req.body.password, function(err, data){
			if(err == undefined){
				routeUtils.respond(req, res, data);
			}else{
				routeUtils.respond(req, res, err);
			}
		});
	});
	
	app.post('/users/signup', function(req, res){
		usersImpl.signup(req.body.username, req.body.password, function(err, data){
			if(err == undefined){
				routeUtils.respond(req, res, data);
			}else{
				routeUtils.respond(req, res, err);
			}
		});
	});
	
	app.post('/users/forgot', function(req, res){
		usersImpl.forgot(req.body.username, function(err, data){
			if(err == undefined){
				routeUtils.respond(req, res, data);
			}else{
				routeUtils.respond(req, res, err);
			}
		});
	});
	
	app.post('/users/send_verification', function(req, res){
		usersImpl.sendVerificationEmail(req.body.username, function(err, data){
			if(err == undefined){
				routeUtils.respond(req, res, data);
			}else{
				routeUtils.respond(req, res, err);
			}
		});
	});
};

module.exports = function(app){
	return new UsersRoute(app);
};