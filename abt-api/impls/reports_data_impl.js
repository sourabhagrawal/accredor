var comb = require('comb');
var _ = require('underscore');
var logger = require(LIB_DIR + 'log_factory').create("reports_data_impl");
var impl = require('./impl.js');
var experimentsImpl = require('./experiments_impl');
var variationsImpl = require('./variations_impl');
var goalsImpl = require('./goals_impl');
var linksImpl = require('./links_impl');
var variationVisitsImpl = require('./variation_visits_impl');
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
		
		getVariationData : function(variation, goals, controlConversions, callback){
			var variationData = {};
			
			var isControl = variation.isControl;
			variationData.name = variation.name;
			variationData.isControl = variation.isControl;
			
			variationVisitsImpl.search(function(err, data){
				if(err){
					callback(err);
				}else{
					var rows = data.data;
					var visitsMap = {};
					_.each(rows, function(row){
						var goalId = row['goalId'];
						var visits = row['visits'];
						
						visitsMap[goalId] = visitsMap[goalId] || 0;
						visitsMap[goalId] += parseInt(visits);
					});
					
					console.log(visitsMap);
					
					variationData.total = visitsMap["0"] || 0;
					
					//TODO Fetch hits for all goals
					variationData.goals = {};
					_.each(goals, function(goal){
						var goalVisits =  visitsMap[goal.id] || 0;
						var total = variationData.total;
						var conversion = total == 0 ? 0 : Math.round((goalVisits * 100.0 / total) * 100)/100;
						var improvement = 0;
						if(!isControl){
							controlConversion = controlConversions[goal.id];
							improvement = controlConversion == 0 ? 0 : Math.round((((conversion - controlConversion) * 100) / controlConversion)*100) / 100; 
						}else{
							controlConversions[goal.id] = conversion;
						}
						
						variationData.goals[goal.id] = {
							visits : goalVisits,
							conversion : conversion,
							improvement : improvement
						};
					});
					
					callback(null, variationData);
				}
			}, 'variationId:eq:' + variation.id, 0, -1);
		},
		
		getReportDataforExperiment : function(ex, goals, callback){
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
				}, 'userId:eq: ' + ex.userId + 'isDisabled:eq:0___status:eq:' + GOAL.CREATED, 0 , -1);
			}
			
			var responseData = {
				name : ex.name,
			};
			
			bus.on('start', function(){
				variationsImpl.search(function(err, data){
					if(err){
						callback(err);
					}else{
						variations = data.data;
						bus.fire('variations_fetched', variations);
					}
				}, 'experimentId:eq:' + ex.id + '___isDisabled:eq:0', 0, -1, 'isControl', 'DESC');
			});
			
			bus.on('variations_fetched', function(variations){
				responseData.variations = [];
				var controlConversions = {};
				
				if(variations.length > 0){
					_.each(variations, function(variation){
						if(variation.isControl){
							ref.getVariationData(variation, goals, controlConversions, function(err, data){
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
						if(!variation.isControl){
							ref.getVariationData(variation, goals, controlConversions, function(err, data){
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
		
		getById : function(id, callback){
			var ref = this;
			if(id == null){
				callback(response.error(codes.error.ID_NULL));
			}else{
				var exId = id;
				
				experimentsImpl.getById(exId, function(err, data){
					if(err){
						callback(err);
					}else{
						ref.getReportDataforExperiment(data.data, function(err, data){
							if(err){
								callback(err);
							}else{
								callback(null,response.success(data, 1, codes.success.RECORD_FETCHED([ref.displayName, id])));
							}
						});
					}
				});
			}
		},
		
		getReportsDataForUser : function(userId, callback){
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
				}, 'userId:eq: ' + userId + 'isDisabled:eq:0___status:eq:' + GOAL.CREATED, 0 , -1);
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
					}, 'userId:eq: ' + userId + 'isDisabled:eq:0___status:eq:' + EXPERIMENT.STARTED, 0 , -1);
				}
			});
			
			bus.on('experiments_fetched', function(experiments, goals){
				var count = 0;
				if(experiments.length == 0){
					callback(null, response.success([], 0, codes.success.RECORDS_SEARCHED([ref.displayName])));
				}else{
					_.each(experiments, function(experiment){
						ref.getReportDataforExperiment(experiment, goals, function(err, data){
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