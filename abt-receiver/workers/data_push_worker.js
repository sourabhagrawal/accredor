var _ = require('underscore');
var CONFIG = require('config');
var redis = require("redis");

var logger = require(LIB_DIR + 'log_factory').create("data_push_worker");
var visitsClient = require(CLIENTS_DIR + 'variation_visits_client');
var Lock = require(LIB_DIR + 'lock');

/**
 * A worker thread that will push visits data periodically to mysql
 */
var DataPushWorker = function(){
	
	var ref = this;
	
	CONFIG.dataPush = CONFIG.dataPush || {};
	var interval = CONFIG.dataPush.interval || 10 * 1000; //10 Secs
	
	var client = redis.createClient();
	
	var acquireLockAndPush = function(key, field, visits){
		var variationId = key.replace('v:', '');
		var goalId = 0;
		if(field != 'total'){
			goalId = field.replace('g:', '');
		}
		
		var params = {
			variationId : variationId,
			goalId : goalId,
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
			client.keys('v:*', function(err, replies){
				if(err){
					logger.error(err);
				}else{
					logger.info(replies.length + ' variation keys found');
					_.each(replies, function(key){
						client.hkeys(key, function(err, replies){
							if(err){
								logger.error(err);
							}else{
								_.each(replies, function(field){
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
					});
				}
			});
			
			setTimeout(ref.run, interval);
		}
	};
};

module.exports = DataPushWorker;