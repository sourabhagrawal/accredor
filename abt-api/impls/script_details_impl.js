var comb = require('comb');
var _ = require('underscore');
var check = require('validator').check;
var logger = require(LIB_DIR + 'log_factory').create("script_details_impl");
var impl = require('./impl.js');
var emitter = require(LIB_DIR + 'emitter');
var scriptDetailsDao = require(DAOS_DIR + 'script_details_dao');
var codes = require(LIB_DIR + 'codes');
var response = require(LIB_DIR + 'response');
var StateMachine = require('./transitions_impl');
var Bus = require(LIB_DIR + 'bus');

var ScriptDetailsImpl = comb.define(impl,{
	instance : {
		displayName : "Script Details",
		constructor : function(options){
			options = options || {};
			options.dao = scriptDetailsDao;
			options.auditableFields = ['file_name', 'status', 'isOld'];
			
            this._super([options]);
            
            var ref = this;
            emitter.on(EVENT_MARK_SCRIPT_OLD, function(userId){
            	ref.markScriptOld(userId, function(err, data){
            		if(err)
            			logger.error(err);
            		else
            			logger.info('marked script old for user : ' + userId);
            	});
            });
		},
		
		markScriptOld : function(userId, callback){
			var ref = this;
			
			this.search(function(err, data){
				if(err){
					callback(err);
				}else{
					if(data && data.data && data.data.length > 0){
						var scriptDetail = data.data[0];
						
						//If in processing state.. wait a while. (2 secs)
						if(scriptDetail.status == SCRIPT_DETAILS.PROCESSING)
							setTimeout(ref.markScriptOld(userId, callback), 2 * 1000);
						else // Mark it old. Yay!
							ref.update(scriptDetail.id, {isOld : 1}, callback);
					}else{
						// If script not found.. serious issue.. log it and create an entry.
						logger.error("Script Details for user : " + userId + " not found");
						ref.create({userId : userId}, callback);
					}
				}
			}, 'userId:eq:' + userId);
			
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
			
			// Start with is_old = 1 so that script is created for it by the worker
			params['isOld'] = 1;
			
			// Assign a file name
			params['fileName'] = parseInt(params['userId']) + 7615327; // Random number 7615327
			
			bus.on('start', function(){
				StateMachine.getStartState(SCRIPT_DETAILS.name, function(err, data){
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
						callback(response.error(codes.error.SCRIPT_DETAILS_EXISTS()));
					}else{
						bus.fire('noDuplicates');
					}
				}, 'userId:eq:' + userId);
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
						callback(response.error(codes.error.SCRIPT_DETAILS_USER_ID_CANT_UPDATE()));
						return;
					}
					
					if(params.fileName && params.fileName != model.fileName){
						// Can't change the user id of an experiment
						callback(response.error(codes.error.SCRIPT_DETAILS_FILE_NAME_CANT_UPDATE()));
						return;
					}
					
					if(params.status && params.status != model.status){
						StateMachine.isValidTransition(SCRIPT_DETAILS.name, model.status, params.status, function(err, data){
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

module.exports = new ScriptDetailsImpl();