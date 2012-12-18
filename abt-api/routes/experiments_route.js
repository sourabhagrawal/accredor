var routeUtils = require('./route_utils.js');
var logger = require(LIB_DIR + 'log_factory').create("experiments_route");
var experimentsImpl = require(IMPLS_DIR + 'experiments_impl');

var ExperimentsRoute = function(app){
	app.post('/experiments/split_experiment', function(req, res){
		req.body = req.body || {};
		req.body.userId = req.body.userId || req.user.id;
		if(req.user){
			req.body.createdBy = req.user.id;
		}
		experimentsImpl.createSplitExperiment(req.body, function(err, data){
			if(err == undefined){
				routeUtils.respond(req, res, data);
			}else{
				routeUtils.respond(req, res, err);
			}
		});
	});
	
	app.get('/experiments/split_experiment/:id', function(req, res){
		experimentsImpl.getSplitExperimentById(req.params.id, function(err, data){
			if(err == undefined){
				routeUtils.respond(req, res, data);
			}else{
				routeUtils.respond(req, res, err);
			}
		});
	});
	
	app.get('/experiments/:id', function(req, res){
		routeUtils.getById(req, res, experimentsImpl);
	});
	
	app.post('/experiments', function(req, res){
		req.body = req.body || {};
		req.body.userId = req.body.userId || req.user.id;
		routeUtils.create(req, res, experimentsImpl);
	});
	
	app.put('/experiments/split_experiment/:id', function(req, res){
		if(req.user){
			req.body.updatedBy = req.user.id;
		}
		experimentsImpl.updateSplitExperiment(req.params.id, req.body, function(err, data){
			if(err == undefined){
				routeUtils.respond(req, res, data);
			}else{
				routeUtils.respond(req, res, err);
			}
		});
	});
	
	app.put('/experiments/:id', function(req, res){
		routeUtils.update(req, res, experimentsImpl);
	});
		
	app.get('/experiments', function(req, res){
		routeUtils.search(req, res, experimentsImpl);
	});
};

module.exports = function(app){
	return new ExperimentsRoute(app);
};