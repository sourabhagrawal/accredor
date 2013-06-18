var comb = require('comb');
var _ = require('underscore');
var check = require('validator').check;
var logger = require(LIB_DIR + 'log_factory').create("experiments_impl");
var impl = require('./impl.js');
var emitter = require(LIB_DIR + 'emitter');
var experimentsDao = require(DAOS_DIR + 'experiments_dao');
var codes = require(LIB_DIR + 'codes');
var response = require(LIB_DIR + 'response');
var StateMachine = require('./transitions_impl');
var linksImpl = require('./links_impl');
var variationsImpl = require('./variations_impl');
var Bus = require(LIB_DIR + 'bus');

var ExperimentsImpl = comb.define(impl,{
	instance : {
		displayName : "Experiment",
		constructor : function(options){
			options = options || {};
			options.dao = experimentsDao;
			options.auditableFields = ['name', 'status', 'type', 'isDisabled'];

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
				callback(response.error(codes.error.EXPERIMENT_NAME_REQUIRED()));
				return;
			}
			
			// Type should not be blank
			var type = params['type'];
			try{
				check(type).notNull().notEmpty();
			}catch(e){
				callback(response.error(codes.error.EXPERIMENT_TYPE_REQUIRED()));
				return;
			}
			
			// A link has to be provided
			var links = params['links'];
			try{
				check(links).notNull();
			}catch(e){
				callback(response.error(codes.error.EXPERIMENT_URL_EMPTY()));
				return;
			}
			
			// URL should not be blank
			var url = links[0]['url'];
			try{
				check(url).notNull().notEmpty();
			}catch(e){
				callback(response.error(codes.error.EXPERIMENT_URL_EMPTY()));
				return;
			}
			
			// URL should be valid
			try{
				check(url).isUrl();
			}catch(e){
				callback(response.error(codes.error.INVALID_EXPERIMENT_URL()));
				return;
			}
			
			// Link type should not be blank
			var linkType = links[0]['type'];
			try{
				check(linkType).notNull().notEmpty();
			}catch(e){
				callback(response.error(codes.error.EXPERIMENT_URL_TYPE_EMPTY()));
				return;
			}
			
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
				}, 'userId:eq:' + params.userId + '___name:eq:' + params.name + '___isDisabled:eq:0');
			});
			
			bus.on('noDuplicates', function(){
				m.call(ref, params, function(err, data){
					if(err){
						callback(err, null);// Respond back with error
					}else{
						//Create a link
						var experiment = data.data;
						bus.fire('experiment_created', params, experiment);
					}
				});
			});
			
			bus.on('experiment_created', function(params, experiment){
				var payload = {
					experimentId : experiment.id,
					url : url,
					type : linkType,
					createdBy : experiment.createdBy,
					userId : experiment.userId
				};
				linksImpl.create(payload, function(err, data){
					if(err){
						callback(err);
					}else{
						var link = data.data;
						experiment.links = [link];
						callback(null,response.success(experiment, 1, codes.success.RECORD_CREATED([ref.displayName])));
						
						bus.fire('link_created', experiment);
						// Mark script old for the user
						emitter.emit(EVENT_MARK_SCRIPT_OLD, userId);
					}
				});
			});
			
			bus.on('link_created', function(experiment){
				var payload = {
					experimentId : experiment.id,
					name : 'Control',
					isControl : 1,
					createdBy : experiment.createdBy,
					userId : experiment.userId
				};
				
				if(experiment.type == EXPERIMENT.types.SPLITTER){
					payload['type'] = VARIATION.types.URL;
					payload['script'] = experiment.links[0].url;
				}else if(experiment.type == EXPERIMENT.types.ABTEST){
					payload['type'] = VARIATION.types.AB;
				}
				
				variationsImpl.create(payload, function(err, data){
					if(err){
						callback(err);
					}else{
						var variation = data.data;
						experiment.variations = [variation];
						callback(null,response.success(experiment, 1, codes.success.RECORD_CREATED([ref.displayName])));
						
						// Mark script old for the user
						emitter.emit(EVENT_MARK_SCRIPT_OLD, userId);
					}
				});
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
				
				var links = params['links'];
				if(links && links.length > 0){
					// A link has to be provided
					try{
						check(links).notNull();
					}catch(e){
						callback(response.error(codes.error.EXPERIMENT_URL_EMPTY()));
						return;
					}
					
					// URL should not be blank
					var url = links[0]['url'];
					try{
						check(url).notNull().notEmpty();
					}catch(e){
						callback(response.error(codes.error.EXPERIMENT_URL_EMPTY()));
						return;
					}
					
					// URL should be valid
					try{
						check(url).isUrl();
					}catch(e){
						callback(response.error(codes.error.INVALID_EXPERIMENT_URL()));
						return;
					}
					
					// Link type should not be blank
					var linkType = links[0]['type'];
					try{
						check(linkType).notNull().notEmpty();
					}catch(e){
						callback(response.error(codes.error.EXPERIMENT_URL_TYPE_EMPTY()));
						return;
					}
				}
				
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
						callback(response.error(codes.error.EXPERIMENT_USER_ID_CANT_UPDATE()));
						return;
					}
					
					if(params.type && params.type != model.type){
						// Can't change the type of a experiment
						callback(response.error(codes.error.EXPERIMENT_TYPE_CANT_UPDATE()));
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
						}, 'userId:eq:' + model.userId + '___name:eq:' + name + '___isDisabled:eq:0');
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
					m.call(ref, id, params, function(err, data){
						if(err){
							callback(err, null);// Respond back with error
						}else{
							//Create a link
							var experiment = data.data;
							bus.fire('experiment_updated', id, params, experiment);
						}
					});
					
					// Mark script old for the user
					emitter.emit(EVENT_MARK_SCRIPT_OLD, userId);
				});
				
				bus.on('experiment_updated', function(id, params, experiment){
					ref.getLinksForExperiment(id, function(err, data){
						if(err){
							callback(err);
						}else{
							if(links && links.length > 0 && links[0]['url']){ // If URL is getting updated
								if(data.totalCount > 0){
									var link = data.data[0];
									bus.fire('link_fetched', link.id, params, experiment);
								}else{
									bus.fire('create_link', params, experiment);
								}
							}else{
								if(data.totalCount > 0){
									var link = data.data[0];
									experiment.links = [link];
									callback(null,response.success(experiment, 1, codes.success.RECORD_UPDATED([ref.displayName, id])));
								}
							}
							
						}
					});
				});
				
				bus.on('create_link', function(params, experiment){
					var payload = {
						experimentId : experiment.id,
						url : links[0]['url'],
						type : links[0]['type'],
						createdBy : experiment.createdBy,
						userId : experiment.userId
					};
					linksImpl.create(payload, function(err, data){
						if(err){
							callback(err);
						}else{
							var link = data.data;
							experiment.links = [link];
							callback(null,response.success(experiment, 1, codes.success.RECORD_CREATED([ref.displayName])));
						}
					});
				});
				
				bus.on('link_fetched', function(linkId, params, experiment){
					var payload = {
						url : links[0]['url'],
						type : links[0]['type'],
						updatedBy : experiment.createdBy,
						userId : experiment.userId
					};
					linksImpl.update(linkId, payload, function(err, data){
						if(err){
							callback(err);
						}else{
							var link = data.data;
							experiment.links = [link];
							callback(null,response.success(experiment, 1, codes.success.RECORD_UPDATED([ref.displayName, id])));
						}
					});
				});
				
				bus.fire('start');
			}
			
		},
		
		getLinksForExperiment : function(experimentId, callback){
			linksImpl.search(function(err, data){
				if(err){
					callback(err);
				}else{
					var links = data;
					callback(null, links);
				}
			}, 'experimentId:eq:' + experimentId + "___isDisabled:eq:0", null, null, 'id', 'ASC');
		},
		
		getById : function(id, callback){
			var bus = new Bus();
			
			var ref = this;
			var m = this._getSuper();
			
			bus.on('start', function(){
				m.call(ref, id, function(err, data){
					if(err){
						callback(err, null);// Respond back with error
					}else{
						//Get Links
						var experiment = data.data;
						bus.fire('experiment_fetched', experiment);
					}
				});
			});
			
			bus.on('experiment_fetched', function(experiment){
				ref.getLinksForExperiment(experiment.id, function(err, data){
					if(err){
						callback(err);
					}else{
						var links = data.data;
						experiment.links = links;
						callback(null,response.success(experiment, 1, codes.success.RECORD_FETCHED([ref.displayName, id])));
					}
				});
			});
			
			bus.fire('start');
		},
		
		search : function(callback, query, start, fetchSize, sortBy, sortDir){
			var ref = this;
			
			var bus = new Bus();
			var m = this._getSuper();
			
			bus.on('start', function(){
				m.call(ref, function(err, data){
					if(err){
						callback(err, null);// Respond back with error
					}else{
						//Get Links
						var experiment = data.data;
						bus.fire('experiments_fetched', experiment);
					}
				}, query, start, fetchSize, sortBy, sortDir);
			});
			
			bus.on('experiments_fetched', function(experiments){
				if(experiments.length > 0){
					var count = 0;
					_.each(experiments, function(experiment){
						ref.getLinksForExperiment(experiment.id, function(err, data){
							if(err){
								callback(err);
							}else{
								var links = data.data;
								experiment.links = links;
								
								if(++count == experiments.length){
									callback(null,response.success(experiments, experiments.length, codes.success.RECORDS_SEARCHED([ref.displayName])));
								};
							};
						});
					});
				}else{
					callback(null,response.success(experiments, experiments.length, codes.success.RECORDS_SEARCHED([ref.displayName])));
				}
			});
			
			bus.fire('start');
		}
	}
});

module.exports = new ExperimentsImpl();