var _ = require('underscore');
var CONFIG = require('config');
var fs = require('fs');

var logger = require(LIB_DIR + 'log_factory').create("script_file_worker");
var generator = require(LIB_DIR + 'generator');
var client = require(CLIENTS_DIR + 'script_details_client');

/**
 * A worker thread that will generate Script files periodically and update their status
 */


var ScriptFileWorker = function(){
	
	var ref = this;
	
	CONFIG.scriptGeneration = CONFIG.scriptGeneration || {};
	var interval = CONFIG.scriptGeneration.interval || 10 * 1000; //10 Secs
	var batchSize = CONFIG.scriptGeneration.batchSize || 5;
	
	this.run = function(){
		if(CONFIG.scriptGeneration.enabled && (CONFIG.scriptGeneration.enabled == true || CONFIG.scriptGeneration.enabled == 'true')){
			client.search(function(err, response){
				if(err){
					logger.error(err);
					setTimeout(ref.run, interval);
				}else{
					var data = JSON.parse(response.body);
					if(data && data.status && data.status.code == 1000){
						if(data.totalCount > 0){
							var scriptDetails = data.data;
							_.each(scriptDetails, function(scriptDetail){
								client.update(scriptDetail.id, {status : 'processing'}, 
										function(err, data){
											if(err)
												logger.error(err);
											else{
												var code = generator.run(scriptDetail['data']);
												var fileName = scriptDetail['fileName'] + '.js';
												fs.writeFile('public/scripts/' + fileName, code, function(err){
													if(err){
														logger.error(err);
													}else{
														logger.info('Script file written : ' + fileName);
														
														client.update(scriptDetail.id, {status : 'scripted'}, 
																function(err, data){
																	if(err)
																		logger.error(err);
																	else{
																		logger.info('script details updated as scripted');
																	}
																});
													}
												});
											}
										});
							});
							
							setTimeout(ref.run, interval);
						}else{
							setTimeout(ref.run, interval);
							logger.info("No files to generate. Will try again after " + interval + " millisecs. Now : " + new Date());
						}
					}else{
						setTimeout(ref.run, interval);
						logger.error("Unusual error in fetching script details");
					}
				}
			}, 'status:eq:not_scripted', 0, batchSize);
		}
	};
};

module.exports = ScriptFileWorker;