var comb = require('comb');
var _ = require('underscore');
var logger = require(LIB_DIR + 'log_factory').create("transitions_impl");
var impl = require('./impl.js');
var emitter = require(LIB_DIR + 'emitter');
var transitionsDao = require(DAOS_DIR + 'transitions_dao');
var statesImpl = require('./states_impl');
var codes = require(LIB_DIR + 'codes');
var response = require(LIB_DIR + 'response');
var Bus = require(LIB_DIR + 'bus');

var TransitionsImpl = comb.define(impl,{
	instance : {
		displayName : "Transition",
		constructor : function(options){
			options = options || {};
			options.dao = transitionsDao;
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
		
		isValidTransition : function(entityName, fromStateName, toStateName, callback){
			var bus = new Bus();
			
			bus.on('start', function(){
				statesImpl.getByName(entityName, fromStateName, function(err, data){
					if(err != null){
						callback(err, null);
						return;
					}else{
						bus.fromState = data.data;
						bus.fire('fromStateFound');
					}
				});
			});
			
			bus.on('fromStateFound', function(){
				statesImpl.getByName(entityName, toStateName, function(err, data){
					if(err != null){
						callback(err, null);
						return;
					}else{
						bus.toState = data.data;
						bus.fire('toStateFound');
					}
				});
			});
			
			bus.on('toStateFound', function(){
				this.search(function(err, data){
					if(err != null){
						callback(err, null);
					}else{
						if(data && data.status && data.status.code == 1000 && data.totalCount == 1){
							callback(null, data);
						}else{
							callback(response.error(codes.error.TRANSITION_NOT_ALLOWED));
						}
					}
				}, "entityName:eq:" + entityName + "___fromStateId:eq:" + fromStateId + "___toStateId:eq:" + toStateId);
			});
			
			bus.fire('start');
		},
		
		isStartState : function(entityName, stateName, callback){
			statesImpl.isStartState(entityName, stateName, callback);
		}
	}
});

module.exports = new TransitionsImpl();