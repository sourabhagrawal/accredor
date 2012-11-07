var comb = require('comb');
var _ = require('underscore');
var logger = require('./../lib/log_factory').create("impl");
var response = require('../lib/response');
var codes = require('../lib/codes');

var Impl = comb.define(null,{
	instance : {
		displayName : "Record",
		constructor : function(options){
			options = options || {};
			this._super(arguments);
			
            this._dao = options.dao;
		},
		
		foo : function(callback){
			console.log("In foo");
			callback(null, null);
		},

		getById : function(id, callback){
			var ref = this;
			if(id == null){
				callback(response.error(codes.error.ID_NULL));
			}else{
				this._dao.getById(id).then(function(model){
					if(model == undefined){
						callback(response.error(codes.error.RECORD_WITH_ID_NOT_EXISTS([ref.displayName, id])));
					}else
						callback(null,response.success(model.toJSON(), 1, codes.success.RECORD_FETCHED([ref.displayName, id])));
				}, function(error){
					logger.error(error);
					callback(response.error(codes.error.RECORD_WITH_ID_NOT_FETCHED([ref.displayName, id])));
				});
			}
		},
		
		create : function(params, callback){
			logger.debug("Entering create");
			var ref = this;
			this._dao.create(params).then(function(model){
				callback(null,response.success(model.toJSON(), 1, codes.success.RECORD_CREATED([ref.displayName])));
			}, function(error){
				logger.error(error);
				callback(response.error(codes.error.CREATION_FAILED([ref.displayName])));
			});
			logger.debug("Exiting create");
		},
		
		update : function(id, params, callback){
			var ref = this;
			if(id == null){
				callback(response.error(codes.error.ID_NULL));
			}else{
				this._dao.getById(id).then(function(model){
					if(model == undefined){
						callback(response.error(codes.error.RECORD_WITH_ID_NOT_EXISTS([ref.displayName, id])));
					}else{
						ref._dao.update(model, params).then(function(m){
							callback(null,response.success(m.toJSON(), 1, codes.success.RECORD_UPDATED([ref.displayName, id])));
						}, function(error){
							logger.error(error);
							callback(response.error(codes.error.UPDATION_FAILED([ref.displayName, id])));
						});
					}
				}, function(error){
					logger.error(error);
					callback(response.error(codes.error.RECORD_WITH_ID_NOT_FETCHED([ref.displayName, id])));
				});
			}
			
		},
		
		/**
		 * 
		 * @param query 'field1:op1:value1___field2:op2:value2'
		 * @param start Defaults to 0
		 * @param fetchSize Defaults to 10. if == -1 return all 
		 * @param sortBy Defaults to id
		 * @param sortDir Defaults to DESC
		 */
		search : function(callback, query, start, fetchSize, sortBy, sortDir){
			var ref = this;
			var filters = [];
			if(query != null){
				var tokens = query.split('___');
				_.each(tokens, function(token){
					var filter = {};
					_.map(token.split(':'), function(prop, key){
						if(key == 0){
							filter.field = prop;
						}else if(key == 1){
							filter.op = prop;
						}else if(key == 2){
							if(prop.indexOf(',') != -1)
								filter.value = prop.split(',');
							else
								filter.value = prop;
						}
					});
					filters.push(filter);
				});
			}
			this._dao.search(filters, start, fetchSize, sortBy, sortDir).then(function(models){
				var modelsJSON = []; 
				_.each(models, function(model){
					modelsJSON.push(model.toJSON());
				});
				callback(null,response.success(modelsJSON, modelsJSON.length, codes.success.RECORDS_SEARCHED([ref.displayName])));
			}, function(error){
				logger.error(error);
				callback(response.error(codes.error.SEARCH_FAILED([ref.displayName])));
			});
		}
	}
});

module.exports = Impl;