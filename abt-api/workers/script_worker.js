var _ = require('underscore');
var logger = require(LIB_DIR + 'log_factory').create("script_worker");
var scriptDetailsImpl = require(IMPLS_DIR + 'script_details_impl');
var experimentsImpl = require(IMPLS_DIR + 'experiments_impl');
var variationsImpl = require(IMPLS_DIR + 'variations_impl');
var linksImpl = require(IMPLS_DIR + 'links_impl');
var goalsImpl = require(IMPLS_DIR + 'goals_impl');
var CONFIG = require('config');
var eventEmitter = require('events').EventEmitter;

/**
 * A worker thread that will pick old scripts and generate fresh user data
 */


var ScriptWorker = function(){
	/*
	 * 
	 */
	var ref = this;
	
	CONFIG.script = CONFIG.script || {};
	var interval = CONFIG.script.interval || 5 * 1000; //5 Secs
	var batchSize = CONFIG.script.batchSize || 5;
	
	this.run = function(){
		if(CONFIG.script.enabled && (CONFIG.script.enabled == true || CONFIG.script.enabled == 'true')){
			
			scriptDetailsImpl.search(function(err, data){
				if(err){
					logger.error(err);
					setTimeout(ref.run, interval);
				}else{
					if(data && data.data && data.data.length > 0){
						var scriptDetails = data.data;
						_.each(scriptDetails, function(scriptDetail){
							var userId = scriptDetail['userId'];
							
							logger.info('generating script data for user : ' + userId);
							
							var localEmitter = new eventEmitter();
							
							var experimentsDone = false;
							var goalsDone = false;
							
							localEmitter.on('check_u', function(){
								if(experimentsDone && goalsDone){
									localEmitter.emit('all_data_fetched');
								}
							});
							
							// The out put data
							var scriptData = {exs : [], gs : []};
							
							experimentsImpl.search(function(err, data){
								if(err){
									logger.error(err);
								}else{
									var experiments = data.data;
									if(experiments && experiments.length > 0){
										var count = 0;
										
										//Iterate over experiments and fetch data for each
										_.each(experiments, function(experiment){
											var experimentId = experiment.id;
											var experimentData = {
												id : experimentId,
												vs : [],
												ls : []
											};
											scriptData.exs.push(experimentData);
											
											variationsDone = false;
											linksDone = false;
											
											localEmitter.on('check_ex', function(){
												if(variationsDone && linksDone){
													count++;
													if(count == experiments.length){
														experimentsDone = true;
														localEmitter.emit('check_u');
													}
												}
											});
											
											// Fetch variations
											variationsImpl.search(function(err, data){
												if(err){
													logger.error(err);
												}else{
													var variations = data.data;
													if(variations && variations.length > 0){
														_.each(variations, function(variation){
															experimentData.vs.push({
																id : variation.id,
																type : variation.type,
																isControl : variation.isControl,
																script : variation.script,
																percent : variation.percent
															});
														});
													}
												}
												variationsDone = true;
												localEmitter.emit('check_ex');
											}, 'experimentId:eq:' + experimentId + '___isDisabled:eq:0');
											
											// Fetch variations
											linksImpl.search(function(err, data){
												if(err){
													logger.error(err);
												}else{
													var links = data.data;
													if(links && links.length > 0){
														_.each(links, function(link){
															experimentData.ls.push({
																id : link.id,
																url : link.url,
																type : link.type
															});
														});
													}
												}
												linksDone = true;
												localEmitter.emit('check_ex');
											}, 'experimentId:eq:' + experimentId + '___isDisabled:eq:0');
										});
									}else{
										experimentsDone = true;
										localEmitter.emit('check_u');
									}
								}
							}, 'userId:eq:' + userId + '___isDisabled:eq:0___status:eq:' + EXPERIMENT.STARTED);
							
							//Fetch goals
							goalsImpl.search(function(err, data){
								if(err){
									logger.error(err);
								}else{
									var goals = data.data;
									if(goals && goals.length > 0){
										_.each(goals, function(goal){
											scriptData.gs.push({
												id : goal.id,
												type : goal.type,
												url : goal.url
											});
										});
									}
								}
								goalsDone = true;
								localEmitter.emit('check_u');
							}, 'userId:eq:' + userId + '___isDisabled:eq:0___status:eq:' + GOAL.CREATED);
							
							//If all is fetched. update the script details with new data
							localEmitter.on('all_data_fetched', function(){
								scriptDetailsImpl.update(scriptDetail.id, {
									data : JSON.stringify(scriptData),
									isOld : 0,
									status : SCRIPT_DETAILS.NOT_SCRIPTED
								}, function(err, data){
									if(err){
										logger.error(err);
									}else{
										logger.info('regenerated script data for user : ' + userId);
									}
								});
							});
						});
						
						setTimeout(ref.run, interval);
					}else{
						setTimeout(ref.run, interval);
						logger.info("Nothing to update in script details.");
					}
				};
			}, 'isOld:eq:1___status:in:' + SCRIPT_DETAILS.NOT_SCRIPTED + ',' + SCRIPT_DETAILS.SCRIPTED, 0, batchSize);
		}
	};
};

module.exports = ScriptWorker;