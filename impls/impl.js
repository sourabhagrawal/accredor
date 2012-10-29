var comb = require('comb');
var _ = require('underscore');
var logger = require('./../lib/log_factory').create("impl");

var Impl = comb.define(null,{
	instance : {
		constructor : function(options){
			options = options || {};
			this._super(arguments);
			
            this._dao = options.dao;
		},

		getById : function(id){
			return this._dao.getById(id);
		},
		
		create : function(params){
			return this._dao.save(params);
		},
		
		update : function(id, params){
			return this._dao.update(id, params);
		},
		
		/**
		 * 
		 * @param query 'field1:op1:value1___field2:op2:value2'
		 * @param start Defaults to 0
		 * @param fetchSize Defaults to 10. if == -1 return all 
		 * @param sortBy Defaults to id
		 * @param sortDir Defaults to DESC
		 */
		search : function(query, start, fetchSize, sortBy, sortDir){
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
			return this._dao.search(filters, start, fetchSize, sortBy, sortDir);
		}
	}
});

module.exports = Impl;