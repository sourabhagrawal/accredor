var comb = require('comb');
var _ = require('underscore');
var logger = require(LIB_DIR + 'log_factory').create("reports_data_impl");
var impl = require('./impl.js');
var experimentsImpl = require('./experiments_impl');
var variationsImpl = require('./variations_impl');
var goalsImpl = require('./goals_impl');
var linksImpl = require('./links_impl');
var goalVisitsImpl = require('./goal_visits_impl');
var codes = require(LIB_DIR + 'codes');
var response = require(LIB_DIR + 'response');
var emitter = require(LIB_DIR + 'emitter');
var Bus = require(LIB_DIR + 'bus');

var ReportsDataImpl = comb.define(impl,{
	instance : {
		displayName : "Report Data",
		constructor : function(options){
			options = options || {};
            this._super([options]);
		},
		
		getCummulativeVariationData : function(variation, goals, controlConversions, callback){
			var variationData = {};
			
			var isControl = variation.isControl;
			variationData.id = variation.id;
			variationData.name = variation.name;
			variationData.isControl = isControl;
			
			goalVisitsImpl.search(function(err, data){
				if(err){
					callback(err);
				}else{
					var rows = data.data;
					var visitsMap = {};
					_.each(rows, function(row){
						var goalId = row['goalId'];
						var visits = row['visits'];
						var hits = row['hits'];
						
						visitsMap[goalId] = visitsMap[goalId] || {};
						visitsMap[goalId]['visits'] = visitsMap[goalId]['visits'] || 0;
						visitsMap[goalId]['hits'] = visitsMap[goalId]['hits'] || 0;
						
						visitsMap[goalId]['visits'] += parseInt(visits);
						visitsMap[goalId]['hits'] += parseInt(hits);
					});
					
					//TODO Fetch hits for all goals
					variationData.goals = {};
					_.each(goals, function(goal){
						var goalVisitsMap =  visitsMap[goal.id] || 0;
						
						var visits = goalVisitsMap['visits'];
						var hits = goalVisitsMap['hits'];
						var conversion = visits == 0 ? 0 : Math.round((hits * 100.0 / visits) * 100)/100;
						
						var improvement = 0;
						if(!isControl){
							controlConversion = controlConversions[goal.id];
							improvement = controlConversion == 0 ? '--' : Math.round((((conversion - controlConversion) * 100) / controlConversion)*100) / 100; 
						}else{
							controlConversions[goal.id] = conversion;
						}
						
						variationData.goals[goal.id] = {
							visits : visits,
							hits : hits,
							conversion : conversion,
							improvement : improvement
						};
					});
					
					callback(null, variationData);
				}
			}, 'variationId:eq:' + variation.id, 0, -1);
		},
		
		getTimeSeriesVariationData : function(variation, goals, controlConversions, callback){
			var variationData = {};
			
			var isControl = variation.isControl;
			variationData.id = variation.id;
			variationData.name = variation.name;
			variationData.isControl = isControl;
			
			goalVisitsImpl.search(function(err, data){
				if(err){
					callback(err);
				}else{
					var rows = data.data;
					var visitsMap = {};
					_.each(rows, function(row){
						var goalId = row['goalId'];
						var visits = parseInt(row['visits']);
						var hits = parseInt(row['hits']);
						var createdAt = row['createdAt'];
						
//						var conversion = visits == 0 ? 0 : Math.round((hits * 100.0 / visits) * 100)/100;
						
						visitsMap[goalId] = visitsMap[goalId] || [];
						visitsMap[goalId].push([new Date(createdAt).getTime(), hits]);
					});
					
					variationData.goals = {};
					_.each(goals, function(goal){
						var goalVisits =  visitsMap[goal.id] || [];
						
						variationData.goals[goal.id] = goalVisits;
					});
					
					callback(null, variationData);
				}
			}, 'variationId:eq:' + variation.id, 0, -1);
		},
		
		searchVariationsForExperiment : function(exId, bus){
			variationsImpl.search(function(err, data){
				if(err){
					callback(err);
				}else{
					variations = data.data;
					bus.fire('variations_fetched', variations);
				}
			}, 'experimentId:eq:' + exId + '___isDisabled:eq:0', 0, -1, 'isControl', 'DESC');
		},
		
		getCummulativeReportDataforExperiment : function(ex, goals, callback){
			var ref = this;
			var bus = new Bus();
			
			//Fetch goals if not sent
			if(goals == undefined){
				goalsImpl.search(function(err, data){
					if(err){
						callback(err);
					}else{
						goals = data.data;
						bus.fire('start');
					}
				}, 'userId:eq: ' + ex.userId + '___isDisabled:eq:0', 0 , -1);
			}
			
			var responseData = {
				experiment_id : ex.id,
				name : ex.name,
			};
			
			bus.on('start', function(){
				ref.searchVariationsForExperiment(ex.id, bus);
			});
			
			bus.on('variations_fetched', function(variations){
				responseData.variations = [];
				var controlConversions = {};
				
				if(variations.length > 0){
					_.each(variations, function(variation){
						if(variation.isControl == 1){
							ref.getCummulativeVariationData(variation, goals, controlConversions, function(err, data){
								if(err){
									callback(err);
									return;
								}else{
									responseData.variations.push(data);
									
									bus.fire('control_conversions_fetched', variations, controlConversions);
								}
							});
						}
					});
				}else{
					bus.fire('variations_data_added');
				}
			});
			
			bus.on('control_conversions_fetched', function(variations, controlConversions){
				var count = 0;
				if(variations.length > 0){
					_.each(variations, function(variation){
						if(variation.isControl == 0){
							ref.getCummulativeVariationData(variation, goals, controlConversions, function(err, data){
								if(err){
									callback(err);
									return;
								}else{
									responseData.variations.push(data);
									
									if(++count == variations.length - 1){
										bus.fire('variations_data_added');
									}
								}
							});
						}
					});
				}else{
					bus.fire('variations_data_added');
				}
			});
			
			bus.on('variations_data_added', function(variations){
				responseData.goals = [];
				_.each(goals, function(goal){
					responseData.goals.push({
						id : goal.id,
						name : goal.name
					});
				});
				
				callback(null, responseData);
			});
			
			bus.fire('start');
		},
		
		getTimeSeriesReportDataforExperiment : function(ex, goals, callback){
			var ref = this;
			var bus = new Bus();
			
			//Fetch goals if not sent
			if(goals == undefined){
				goalsImpl.search(function(err, data){
					if(err){
						callback(err);
					}else{
						goals = data.data;
						bus.fire('start');
					}
				}, 'userId:eq: ' + ex.userId + '___isDisabled:eq:0', 0 , -1);
			}
			
			var responseData = {
				experiment_id : ex.id,
				name : ex.name,
			};
			
			bus.on('start', function(){
				ref.searchVariationsForExperiment(ex.id, bus);
			});
			
			bus.on('variations_fetched', function(variations){
				responseData.variations = [];
				var controlConversions = {};
				
				if(variations.length > 0){
					_.each(variations, function(variation){
						if(variation.isControl == 1){
							ref.getTimeSeriesVariationData(variation, goals, controlConversions, function(err, data){
								if(err){
									callback(err);
									return;
								}else{
									responseData.variations.push(data);
									
									bus.fire('control_conversions_fetched', variations, controlConversions);
								}
							});
						}
					});
				}else{
					bus.fire('variations_data_added');
				}
			});
			
			bus.on('control_conversions_fetched', function(variations, controlConversions){
				var count = 0;
				if(variations.length > 0){
					_.each(variations, function(variation){
						if(variation.isControl == 0){
							ref.getTimeSeriesVariationData(variation, goals, controlConversions, function(err, data){
								if(err){
									callback(err);
									return;
								}else{
									responseData.variations.push(data);
									
									if(++count == variations.length - 1){
										bus.fire('variations_data_added');
									}
								}
							});
						}
					});
				}else{
					bus.fire('variations_data_added');
				}
			});
			
			bus.on('variations_data_added', function(variations){
				responseData.goals = [];
				_.each(goals, function(goal){
					responseData.goals.push({
						id : goal.id,
						name : goal.name
					});
				});
				
				callback(null, responseData);
			});
			
			bus.fire('start');
		},
		
		getCummulativeReportsDataByExperimentId : function(exId, userId, callback){
			var ref = this;
			var bus = new Bus();
			
			if(exId == null){
				callback(response.error(codes.error.ID_NULL));
			}else{
				bus.on('start', function(){
					goalsImpl.search(function(err, data){
						if(err){
							callback(err);
						}else{
							goals = data.data;
							bus.fire('goals_fetched', goals);
						}
					}, 'userId:eq: ' + userId + '___isDisabled:eq:0', 0 , -1);
				});
				
				bus.on('goals_fetched', function(goals){
					if(goals.length == 0){
						callback(null, response.success([], 0, codes.success.RECORDS_SEARCHED([ref.displayName])));
					}else{
						experimentsImpl.getById(exId, function(err, data){
							if(err){
								callback(err);
							}else{
								ref.getCummulativeReportDataforExperiment(data.data, goals, function(err, data){
									if(err){
										callback(err);
									}else{
										callback(null,response.success(data, 1, codes.success.RECORD_FETCHED([ref.displayName, exId])));
									}
								});
							}
						});
					}
				});
				
				bus.fire('start');
			}
		},
		
		getTimeSeriesReportsDataByExperimentId : function(exId, userId, callback){
			var ref = this;
			var bus = new Bus();
			
			if(exId == null){
				callback(response.error(codes.error.ID_NULL));
			}else{
				bus.on('start', function(){
					goalsImpl.search(function(err, data){
						if(err){
							callback(err);
						}else{
							goals = data.data;
							bus.fire('goals_fetched', goals);
						}
					}, 'userId:eq: ' + userId + '___isDisabled:eq:0', 0 , -1);
				});
				
				bus.on('goals_fetched', function(goals){
					if(goals.length == 0){
						callback(null, response.success([], 0, codes.success.RECORDS_SEARCHED([ref.displayName])));
					}else{
						experimentsImpl.getById(exId, function(err, data){
							if(err){
								callback(err);
							}else{
								ref.getTimeSeriesReportDataforExperiment(data.data, goals, function(err, data){
									if(err){
										callback(err);
									}else{
										callback(null,response.success(data, 1, codes.success.RECORD_FETCHED([ref.displayName, exId])));
									}
								});
							}
						});
					}
				});
				
				bus.fire('start');
			}
		},
		
		getCummulativeReportsDataForUser : function(userId, callback){
			var ref = this;
			var bus = new Bus();
			
			var responseData = [];
			
			bus.on('start', function(){
				goalsImpl.search(function(err, data){
					if(err){
						callback(err);
					}else{
						goals = data.data;
						bus.fire('goals_fetched', goals);
					}
				}, 'userId:eq: ' + userId + '___isDisabled:eq:0', 0 , -1);
			});
			
			bus.on('goals_fetched', function(goals){
				if(goals.length == 0){
					callback(null, response.success([], 0, codes.success.RECORDS_SEARCHED([ref.displayName])));
				}else{
					experimentsImpl.search(function(err, data){
						if(err){
							callback(err);
						}else{
							var experiments = data.data;
							bus.fire('experiments_fetched', experiments, goals);
						}
					}, 'userId:eq: ' + userId + '___isDisabled:eq:0', 0 , -1);
				}
			});
			
			bus.on('experiments_fetched', function(experiments, goals){
				var count = 0;
				if(experiments.length == 0){
					callback(null, response.success([], 0, codes.success.RECORDS_SEARCHED([ref.displayName])));
				}else{
					_.each(experiments, function(experiment){
						ref.getCummulativeReportDataforExperiment(experiment, goals, function(err, data){
							if(err){
								callback(err);
							}else{
								responseData.push(data);
								if(++count == experiments.length){
									bus.fire('experiments_data_added');
								}
							}
						});
					});
				}
			});
			
			bus.on('experiments_data_added', function(){
				callback(null, response.success(responseData, responseData.length, codes.success.RECORDS_SEARCHED([ref.displayName])));
			});
			
			bus.fire('start');
		}
	}
});

module.exports = new ReportsDataImpl();