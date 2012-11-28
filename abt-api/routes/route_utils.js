var _ = require('underscore');
var logger = require(LIB_DIR + 'log_factory').create("route");

var RouteUtils = new function(){
	var sendRes = function(req, res, body){
		logger.debug(req.method + " request to URL : " + req.url + " responded with " + JSON.stringify(body));
		res.send(body);
	};
	
	this.respond = sendRes;
	
	this.getById = function(req, res, impl){
		logger.debug("Entering getById");
		impl.getById(req.params.id, function(err, data){
			if(err == undefined){
				sendRes(req, res, data);
			}else{
				sendRes(req, res, err);
			}
		});
	},
	
	this.create = function(req, res, impl){
		logger.debug("Entering create");
		impl.create(req.body, function(err, data){
			if(err == undefined){
				sendRes(req, res, data);
			}else{
				sendRes(req, res, err);
			}
		});
	},
	
	this.update = function(req, res, impl){
		logger.debug("Entering update");
		impl.update(req.params.id, req.body, function(err, data){
			if(err == undefined){
				sendRes(req, res, data);
			}else{
				sendRes(req, res, err);
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
				sendRes(req, res, data);
			}else{
				sendRes(req, res, err);
			}
		}, req.query.q, req.query.start, req.query.fetchSize, req.query.sortBy, req.query.sortDir);
	};
};

module.exports = RouteUtils;