var comb = require('comb');
var _ = require('underscore');
var logger = require(LIB_DIR + 'log_factory').create("impl");
var response = require(LIB_DIR + 'response');
var codes = require(LIB_DIR + 'codes');

/**
 * An Implementation to be extended by all entities to provide their implementations
 * This layer should contain all the business logic.
 */
var Impl = comb.define(null,{
	instance : {
		displayName : "Record",
		constructor : function(options){
			options = options || {};
			this._super(arguments);
			
			/**
			 * Bind it with a DAO
			 */
            this._dao = options.dao;
		},

		/**
		 * Fetches a Model by its Id
		 * @param id
		 * @param callback
		 */
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
		
		/**
		 * Creates a model
		 * @param params
		 * @param callback
		 */
		create : function(params, callback){
			var ref = this;
			this._dao.create(params).then(function(model){
				callback(null,response.success(model.toJSON(), 1, codes.success.RECORD_CREATED([ref.displayName])));
			}, function(error){
				logger.error(error);
				callback(response.error(codes.error.CREATION_FAILED([ref.displayName])));
			});
		},
		
		/**
		 * Updates a model given its Id and map of values to be updated
		 * @param id
		 * @param params
		 * @param callback
		 */
		update : function(id, params, callback){
			var ref = this;
			if(id == null){
				callback(response.error(codes.error.ID_NULL));
			}else{
				this._dao.getById(id).then(function(model){
					if(model == undefined){
						callback(response.error(codes.error.RECORD_WITH_ID_NOT_EXISTS([ref.displayName, id])));
					}else{
						delete params.id;
						logger.info(params);
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
		
		deleteById : function(id, params, callback){
			params = params || {};
			params.isDisabled = 1;
			this.update(id, params, callback);
		},
		
		/**
		 * Parses a string query to generate filters
		 * @param query
		 * @returns {Array} of filters
		 */
		parseSearchQuery : function(query){
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
			
			return filters;
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
			var filters = this.parseSearchQuery(query);
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