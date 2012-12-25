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
			
			var ref = this;
			
			bus.on('start', function(){
				statesImpl.getByName(entityName, fromStateName, function(err, data){
					if(err != null){
						callback(err, null);
						return;
					}else{
						bus.fromState = data.data[0];
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
						bus.toState = data.data[0];
						bus.fire('toStateFound');
					}
				});
			});
			
			bus.on('toStateFound', function(){
				ref.search(function(err, data){
					if(err != null){
						callback(err, null);
					}else{
						if(data && data.status && data.status.code == 1000 && data.totalCount == 1){
							callback(null, data);
						}else{
							callback(response.error(codes.error.TRANSITION_NOT_ALLOWED(fromStateName, toStateName, entityName)));
						}
					}
				}, "entityName:eq:" + entityName + "___fromStateId:eq:" + bus.fromState.id + "___toStateId:eq:" + bus.toState.id);
			});
			
			bus.fire('start');
		},
		
		isStartState : function(entityName, stateName, callback){
			statesImpl.isStartState(entityName, stateName, callback);
		},
		
		getStartState : function(entityName, callback){
			statesImpl.getStartState(entityName, callback);
		}
	}
});

module.exports = new TransitionsImpl();