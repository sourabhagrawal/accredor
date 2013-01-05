var comb = require('comb');
var _ = require('underscore');
var jade = require('jade');
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
		
		lockUpdate : function(modelsJSON, batchSize, count, callback){
			var ref = this;
			this._dao.lockUpdate({status : EMAIL.QUEUED}, {status : EMAIL.PROCESSING})
				.then(function(model){
					if(model){
						modelsJSON.push(model.toJSON());
						if(count == batchSize){
							callback(null, modelsJSON);
						}else
							ref.lockUpdate(modelsJSON, batchSize, count + 1, callback);
					}else{
						callback(null, modelsJSON);
					}
				}, function(error){
					logger.error(error);
					callback(null, modelsJSON);
	//				callback(response.error(codes.error.EMAIL_BATCH_UPDATE_FAILED()));
				});
		},
		
		updateBatchToProcessing : function(batchSize, callback){
			var modelsJSON = [];
			
			this.lockUpdate(modelsJSON, batchSize, 1, function(err, data){
				if(err){
					logger.error(err);
				}else{
					callback(null, response.success(modelsJSON, modelsJSON.length, codes.success.EMAIL_BATCH_UPDATED()));
				}
			});
		},
		
		generateEmailBody : function(template, params, callback){
			var tplPath = EMAILS_DIR + template;
			
			jade.renderFile(tplPath, params, function(err, html){
				if(err != undefined){
					logger.error(err);
					callback(response.error(codes.error.EMAIL_BODY_NOT_BUILT()));
				}else{
					callback(null, html);
				}
			});
		},
		
		sendFromTemplate : function(template, templateOpts, emailOpts, callback){
			var ref = this;
			ref.generateEmailBody(template, templateOpts, function(err, html){
				if(err != undefined){
					logger.error("Failed to compile " + template + " email template");
					callback(err);
				}else{
					emailOpts.body = html;
					ref.create(emailOpts, callback);
				}
			});
		}
	}
});

module.exports = new ExperimentsImpl();