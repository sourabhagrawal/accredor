var routeUtils = require('./route_utils.js');
var logger = require(LIB_DIR + 'log_factory').create("reports_data_route");
var reportsDataImpl = require(IMPLS_DIR + 'reports_data_impl');

var ReportsDataRoute = function(app){
	app.get('/reports_data/:id', function(req, res){
		routeUtils.getById(req, res, reportsDataImpl);
	});
	
	app.get('/reports_data', function(req, res){
		var userId = req.user.id;
		reportsDataImpl.getReportsDataForUser(userId, function(err, data){
			if(err == undefined){
				routeUtils.respond(req, res, data);
			}else{
				routeUtils.respond(req, res, err);
			}
		});
	});
};

module.exports = function(app){
	return new ReportsDataRoute(app);
};