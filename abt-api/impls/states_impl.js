var comb = require('comb');
var _ = require('underscore');
var logger = require(LIB_DIR + 'log_factory').create("states_impl");
var impl = require('./impl.js');
var emitter = require(LIB_DIR + 'emitter');
var statesDao = require(DAOS_DIR + 'states_dao');
var codes = require(LIB_DIR + 'codes');
var response = require(LIB_DIR + 'response');

var StatesImpl = comb.define(impl,{
	instance : {
		displayName : "State",
		constructor : function(options){
			options = options || {};
			options.dao = statesDao;
            this._super([options]);
		},
		create : function(params, callback){
			/**
			 * Do nothing
			 */
		},
		
		update : function(id, params, callback){
			/**
			 * Do nothing
			 */
		},
		
		isStartState : function(entityName, stateName, callback){
			this.search(function(err, data){
				if(err != null){
					callback(err, null);
				}else{
					if(data && data.status && data.status.code == 1000 && data.totalCount == 1){
						callback(null, data);
					}else{
						callback(response.error(codes.error.STATE_NOT_START_STATE([stateName, entityName])));
					}
				}
			}, "entityName:eq:" + entityName + "___name:eq:" + stateName + "___isStartState:eq:1");
		},
		
		getStartState : function(entityName, callback){
			this.search(function(err, data){
				if(err != null){
					callback(err, null);
				}else{
					if(data && data.status && data.status.code == 1000 && data.totalCount == 1){
						callback(null, data);
					}else{
						callback(response.error(codes.error.START_STATE_NOT_FOUND([entityName])));
					}
				}
			}, "entityName:eq:" + entityName + "___isStartState:eq:1");
		},
		
		getByName : function(entityName, stateName, callback){
			this.search(function(err, data){
				if(err != null){
					callback(err, null);
				}else{
					if(data && data.status && data.status.code == 1000 && data.totalCount == 1){
						callback(null, data);
					}else{
						callback(response.error(codes.error.STATE_NOT_FOUND([stateName, entityName])));
					}
				}
			}, "entityName:eq:" + entityName + "___name:eq:" + stateName);
		}
	}
});

module.exports = new StatesImpl();