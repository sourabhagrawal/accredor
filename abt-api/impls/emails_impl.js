var comb = require('comb');
var _ = require('underscore');
var logger = require(LIB_DIR + 'log_factory').create("emails_impl");
var impl = require('./impl.js');
var emitter = require(LIB_DIR + 'emitter');
var emailsDao = require(DAOS_DIR + 'emails_dao');
var codes = require(LIB_DIR + 'codes');
var response = require(LIB_DIR + 'response');
var StateMachine = require('./transitions_impl');
var Bus = require(LIB_DIR + 'bus');

var ExperimentsImpl = comb.define(impl,{
	instance : {
		displayName : "Email",
		constructor : function(options){
			options = options || {};
			options.dao = emailsDao;
            this._super([options]);
		},
		create : function(params, callback){
			var bus = new Bus();
			
			var ref = this;
			var m = this._getSuper();
			
			bus.on('start', function(){
				StateMachine.getStartState(EMAIL.name, function(err, data){
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
				
				// Only Status of an email can be updated
				var status = params.status;
				
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
					if(status && status != model.status){ //Status is getting changed
						StateMachine.isValidTransition(EMAIL.name, model.status, status, function(err, data){
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
					m.call(ref, id, {status : status}, callback);
				});
				
				bus.fire('start');
			}
		},
		
		markSent : function(id, callback){
			this.update(id, {status : EMAIL.SENT}, callback);
		},
		
		markProcessing : function(id, callback){
			this.update(id, {status : EMAIL.PROCESSING}, callback);
		},
		
		markFailed : function(id, callback){
			this.update(id, {status : EMAIL.FAILED}, callback);
		},
		
		markQueued : function(id, callback){
			this.update(id, {status : EMAIL.QUEUED}, callback);
		},
		
		updateBatchToProcessing : function(batchSize, callback){
			this._dao.updateBatch(batchSize, {status : EMAIL.QUEUED}, {status : EMAIL.PROCESSING})
				.then(function(models){
					var modelsJSON = []; 
					_.each(models, function(model){
						modelsJSON.push(model.toJSON());
					});
					callback(null,response.success(modelsJSON, modelsJSON.length, codes.success.EMAIL_BATCH_UPDATED()));
				}, function(error){
					logger.error(error);
					callback(response.error(codes.error.EMAIL_BATCH_UPDATE_FAILED()));
				});
		}
	}
});

module.exports = new ExperimentsImpl();