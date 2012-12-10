var _ = require('underscore');
var logger = require(LIB_DIR + 'log_factory').create("route");

var RouteUtils = new function(){
	this.respond = function(req, res, body){
		logger.debug(req.method + " request to URL : " + req.url + " responded with " + JSON.stringify(body));
		if(body.status && body.status.code == 1000){
			res.send(body);
		}else{
			res.send(500, body);
		}
	};
	
	var ref = this;
	
	this.getById = function(req, res, impl){
		logger.debug("Entering getById");
		impl.getById(req.params.id, function(err, data){
			if(err == undefined){
				ref.respond(req, res, data);
			}else{
				ref.respond(req, res, err);
			}
		});
	},
	
	this.create = function(req, res, impl){
		logger.debug("Entering create");
		if(req.body && req.user){
			req.body.createdBy = req.user.id;
		}
		impl.create(req.body, function(err, data){
			if(err == undefined){
				ref.respond(req, res, data);
			}else{
				ref.respond(req, res, err);
			}
		});
	},
	
	this.update = function(req, res, impl){
		logger.debug("Entering update");
		if(req.body && req.user){
			req.body.updatedBy = req.user.id;
		}
		impl.update(req.params.id, req.body, function(err, data){
			if(err == undefined){
				ref.respond(req, res, data);
			}else{
				ref.respond(req, res, err);
			}
		});
	},
	
	/**
	 * 
	 * @param query 'field1:op1:value1___field2:op2:value2'
	 * @param start Defaults to 0
	 * @param fetchSize Defaults to 10. if == -1 return all 
	 * @param sortBy Defaults to id
	 * @param sortDir Defaults to DESC
	 */
	this.search = function(req, res, impl){
		logger.debug("Entering search");
		impl.search(function(err, data){
			if(err == undefined){
				ref.respond(req, res, data);
			}else{
				ref.respond(req, res, err);
			}
		}, req.query.q, req.query.start, req.query.fetchSize, req.query.sortBy, req.query.sortDir);
	};
};

module.exports = RouteUtils;