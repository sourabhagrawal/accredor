var comb = require('comb');
var _ = require('underscore');
var logger = require('./../lib/log_factory').create("route");

var Route = comb.define(null,{
	instance : {
		constructor : function(options){
			options = options || {};
			this._super(arguments);
			
            this._impl = options.impl;
		},

		getById : function(id){
			return this._impl.getById(id);
		},
		
		create : function(params){
			return this._impl.save(params);
		},
		
		update : function(id, params){
			return this._impl.update(id, params);
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
			return this._impl.search(query, start, fetchSize, sortBy, sortDir);
		}
	}
});

module.exports = Route;