var _ = require('underscore');
var CONFIG = require('config');
var redis = require("redis");

var logger = require(LIB_DIR + 'log_factory').create("experiment_visits_push_worker");
var visitsClient = require(CLIENTS_DIR + 'experiment_visits_client');
var Lock = require(LIB_DIR + 'lock');

/**
 * A worker thread that will push visits data periodically to mysql
 */
var ExperimentVisitsPushWorker = function(){
	
	var ref = this;
	
	CONFIG.dataPush = CONFIG.dataPush || {};
	var interval = CONFIG.dataPush.interval || 10 * 1000; //10 Secs
	
	var client = redis.createClient();
	
	var acquireLockAndPush = function(key, field, visits){
		var keyTokens = key.split('__');
		
		var experimentId = keyTokens[0].replace('e:', '');
		var variationId = 0;
		if(keyTokens.length > 1){
			variationId = keyTokens[1].replace('v:', '');
		}
		
		var params = {
			experimentId : experimentId,
			variationId : variationId,
			visits : visits
		};
		
		var lockKey = key + ":" + field;
		Lock.acquire(lockKey, (new Date().getTime() + Lock.lockTimeOut + 1), 
				function(err, reply){
			if(err){
				logger.error(err);
			}else{
				visitsClient.create(params, function(err, res){
					if(err){
						logger.error(err);
					}else{
						var status = res.statusCode;
						if(status == 200){
							client.hdel(key, field, function(err, data){
								if(err){
									logger.error(err);
								}
							});
						}else{
							logger.error("Push call returned with status : " + status);
						}
					}
					
					Lock.release(lockKey, function(err, reply){
						if(err){
							logger.error(err);
						}
					});
				});
			}
		});
	};
	
	this.run = function(){
		if(CONFIG.dataPush.enabled && (CONFIG.dataPush.enabled == true || CONFIG.dataPush.enabled == 'true')){
			client.keys('e:*', function(err, replies){
				if(err){
					logger.error(err);
				}else{
					logger.info(replies.length + ' experiment keys found');
					_.each(replies, function(key){
						var field = 'visits';
						client.hget(key, field, function(err, reply){
							if(err){
								logger.error(err);
							}else{
								acquireLockAndPush(key, field, reply);
							}
						});
					});
				}
			});
			
			setTimeout(ref.run, interval);
		}
	};
};

module.exports = ExperimentVisitsPushWorker;