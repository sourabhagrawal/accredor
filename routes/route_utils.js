var logger = require('./../lib/log_factory').create("route");

var RouteUtils = new function(){
	this.getById = function(req, res, impl){
		impl.getById(req.params.id, function(err, data){
			if(err == undefined){
				res.send(data);
			}else{
				res.send(err);
			}
		});
	},
	
	this.create = function(req, res, impl){
		impl.create(req.body, function(err, data){
			if(err == undefined){
				res.send(data);
			}else{
				res.send(err);
			}
		});
	},
	
	this.update = function(req, res, impl){
		impl.update(req.params.id, req.body, function(err, data){
			if(err == undefined){
				res.send(data);
			}else{
				res.send(err);
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
		impl.search(function(err, data){
			if(err == undefined){
				res.send(data);
			}else{
				res.send(err);
			}
		}, req.query.q, req.query.start, req.query.fetchSize, req.query.sortBy, req.query.sortDir);
	};
};

module.exports = RouteUtils;