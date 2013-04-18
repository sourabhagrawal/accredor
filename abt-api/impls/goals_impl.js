var comb = require('comb');
var _ = require('underscore');
var check = require('validator').check;
var logger = require(LIB_DIR + 'log_factory').create("goals_impl");
var impl = require('./impl.js');
var emitter = require(LIB_DIR + 'emitter');
var goalsDao = require(DAOS_DIR + 'goals_dao');
var codes = require(LIB_DIR + 'codes');
var response = require(LIB_DIR + 'response');
var StateMachine = require('./transitions_impl');
var Bus = require(LIB_DIR + 'bus');

var GoalsImpl = comb.define(impl,{
	instance : {
		displayName : "Goal",
		constructor : function(options){
			options = options || {};
			options.dao = goalsDao;
			options.auditableFields = ['name', 'url', 'status', 'type', 'prop', 'isDisabled'];
			
            this._super([options]);
		},
		create : function(params, callback){
			var bus = new Bus();
			
			var ref = this;
			var m = this._getSuper();
			
			// User ID should not be valid
			var userId = params['userId'];
			try{
				check(userId).notNull().notEmpty().isInt();
			}catch(e){
				callback(response.error(codes.error.VALID_USER_REQUIRED()));
				return;
			}
			
			// Name should not be blank
			var name = params['name'];
			try{
				check(name).notNull().notEmpty();
			}catch(e){
				callback(response.error(codes.error.GOAL_NAME_REQUIRED()));
				return;
			}
			
			// Type should not be blank
			try{
				check(params['type']).notNull().notEmpty();
			}catch(e){
				callback(response.error(codes.error.GOAL_TYPE_REQUIRED()));
				return;
			}
			
			// URL should not be blank
			try{
				check(params['url']).notNull().notEmpty();
			}catch(e){
				callback(response.error(codes.error.GOAL_URL_REQUIRED()));
				return;
			}
			
			// URL should not be blank
			try{
				check(params['url']).isUrl();
			}catch(e){
				callback(response.error(codes.error.INVALID_GOAL_URL()));
				return;
			}
			
			bus.on('start', function(){
				StateMachine.getStartState(GOAL.name, function(err, data){
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
						callback(response.error(codes.error.GOAL_USER_ID_NAME_EXISTS()));
					}else{
						bus.fire('noDuplicates');
					}
				}, 'userId:eq:' + params.userId + '___name:eq:' + params.name);
			});
			
			bus.on('noDuplicates', function(){
				m.call(ref, params, callback);
				
				// Mark script old for the user
				emitter.emit(EVENT_MARK_SCRIPT_OLD, userId);
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
				
				var userId = null;
				
				bus.on('start', function(){
					ref._dao.getById(id).then(function(model){
						if(model == undefined){
							callback(response.error(codes.error.RECORD_WITH_ID_NOT_EXISTS([ref.displayName, id])));
						}else{
							userId = model.userId;
							bus.fire('modelFound', model);
						}
					}, function(error){
						callback(response.error(codes.error.RECORD_WITH_ID_NOT_FETCHED([ref.displayName, id])));
					});
				});
				
				bus.on('modelFound', function(model){
					if(params.userId && params.userId != model.userId){
						// Can't change the user id of an experiment
						callback(response.error(codes.error.GOAL_USER_ID_CANT_UPDATE()));
						return;
					}
					
					if(params.url && params.url != model.url){ // URL is getting changes
						// URL should not be blank
						try{
							check(params['url']).notNull().notEmpty();
						}catch(e){
							callback(response.error(codes.error.GOAL_URL_REQUIRED()));
							return;
						}
						
						// URL should not be blank
						try{
							check(params['url']).isUrl();
						}catch(e){
							callback(response.error(codes.error.INVALID_GOAL_URL()));
							return;
						}
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
								callback(response.error(codes.error.GOAL_USER_ID_NAME_EXISTS()));
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
						StateMachine.isValidTransition(GOAL.name, model.status, params.status, function(err, data){
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
					
					// Mark script old for the user
					emitter.emit(EVENT_MARK_SCRIPT_OLD, userId);
				});
				
				bus.fire('start');
			}
			
		}
	}
});

module.exports = new GoalsImpl();