var comb = require('comb');
var _ = require('underscore');
var logger = require(LIB_DIR + 'log_factory').create("experiments_impl");
var impl = require('./impl.js');
var emitter = require(LIB_DIR + 'emitter');
var experimentsDao = require(DAOS_DIR + 'experiments_dao');
var codes = require(LIB_DIR + 'codes');
var response = require(LIB_DIR + 'response');
var StateMachine = require('./transitions_impl');
var Bus = require(LIB_DIR + 'bus');

var ExperimentsImpl = comb.define(impl,{
	instance : {
		displayName : "Experiment",
		constructor : function(options){
			options = options || {};
			options.dao = experimentsDao;
            this._super([options]);
		},
		create : function(params, callback){
			var bus = new Bus();
			
			var ref = this;
			var m = this._getSuper();
			
			bus.on('start', function(){
				StateMachine.getStartState(EXPERIMENT.name, function(err, data){
					if(err != null){
						callback(err, null);
						return;
					}else{
						startState = data.data[0].name;
						params['status'] = startState; // Start State
						
						bus.fire('stateSet');
					}
				});
			});
			
			bus.on('stateSet', function(){
				ref.search(function(err,data){
					// If error occurred
					if(err){
						callback(err);
						return;
					}
					
					if(data && data.totalCount > 0){ // Records with same User Id and Name can not exist 
						callback(response.error(codes.error.EXPERIMENT_USER_ID_NAME_EXISTS()));
					}else{
						bus.fire('noDuplicates');
					}
				}, 'userId:eq:' + params.userId + '___name:eq:' + params.name);
			});
			
			bus.on('noDuplicates', function(){
				m.call(ref, params, callback);
			});
			
			bus.fire('start');
		},
		
		update : function(id, params, callback){
			if(id == null){
				callback(response.error(codes.error.ID_NULL));
			}else{
				
				var bus = new Bus();
				
				var ref = this;
				var m = this._getSuper();
				
				bus.on('start', function(){
					ref._dao.getById(id).then(function(model){
						if(model == undefined){
							callback(response.error(codes.error.RECORD_WITH_ID_NOT_EXISTS([ref.displayName, id])));
						}else{
							bus.fire('modelFound', model);
						}
					}, function(error){
						callback(response.error(codes.error.RECORD_WITH_ID_NOT_FETCHED([ref.displayName, id])));
					});
				});
				
				bus.on('modelFound', function(model){
					if(params.userId && params.userId != model.userId){
						// Can't change the user id of an experiment
						callback(response.error(codes.error.EXPERIMENT_USER_ID_CANT_UPDATE()));
						return;
					}
					if(params.name && params.name != model.name){ //Name is getting updated
						var name = params.name || model.name;
						ref.search(function(err,data){
							// If error occurred
							if(err){
								callback(err);
								return;
							}
							
							if(data && data.totalCount > 0){ // Records with same User Id and Name can not exist 
								callback(response.error(codes.error.EXPERIMENT_USER_ID_NAME_EXISTS()));
							}else{
								bus.fire('noDuplicates', model);
							}
						}, 'userId:eq:' + model.userId + '___name:eq:' + name);
					}else{
						bus.fire('noDuplicates', model);
					}
				});
				
				bus.on('noDuplicates', function(model){
					if(params.status && params.status != model.status){
						StateMachine.isValidTransition(EXPERIMENT.name, model.status, params.status, function(err, data){
							if(err != null){
								callback(err, null);
								return;
							}else{
								bus.fire('validOrNoTransitions');
							}
						});
					}else{
						bus.fire('validOrNoTransitions');
					}
				});
				
				bus.on('validOrNoTransitions', function(){
					m.call(ref, id, params, callback);
				});
				
				bus.fire('start');
			}
			
		}
	}
});

module.exports = new ExperimentsImpl();