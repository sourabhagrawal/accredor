var _ = require('underscore');
var CONFIG = require('config');
var redis = require("redis");

var logger = require(LIB_DIR + 'log_factory').create("goal_visits_push_worker");
var visitsClient = require(CLIENTS_DIR + 'goal_visits_client');
var Lock = require(LIB_DIR + 'lock');

/**
 * A worker thread that will push visits data periodically to mysql
 */
var GoalVisitsPushWorker = function(){
	
	var ref = this;
	
	CONFIG.dataPush = CONFIG.dataPush || {};
	var interval = CONFIG.dataPush.interval || 10 * 1000; //10 Secs
	
	var client = redis.createClient();
	
	var acquireLockAndPush = function(key, replies){
		var visits = 0;
		var hits = 0;
		
		if(replies.length > 0){
			visits = replies[0];
			if(replies.length > 1){
				hits = replies[1];
			}
		}
		
		var keyTokens = key.split('__');
		var goalId = keyTokens[0].replace('g:', '');
		var experimentId = 0;
		var variationId = 0;
		if(keyTokens.length > 1){
			experimentId = keyTokens[1].replace('e:', '');
			if(keyTokens.length > 2){
				variationId = keyTokens[2].replace('v:', '');
			}
		}
		
		if(visits != null || hits != null){
			var params = {
				goalId : goalId,
				experimentId : experimentId,
				variationId : variationId,
				visits : visits || 0,
				hits : hits || 0
			};
			
			var lockKey = key + ":" + "visits:hits";
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
								client.hdel(key, 'visits', function(err, data){
									if(err){
										logger.error(err);
									}
								});
								client.hdel(key, 'hits', function(err, data){
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
		}else{
			logger.info(key + " not pushed as both visits and hits are null");
		}
	};
	
	this.run = function(){
		if(CONFIG.dataPush.enabled && (CONFIG.dataPush.enabled == true || CONFIG.dataPush.enabled == 'true')){
			client.keys('g:*', function(err, replies){
				if(err){
					logger.error(err);
				}else{
					logger.info(replies.length + ' goal keys found');
					_.each(replies, function(key){
						client.hmget(key, 'visits', 'hits', function(err, reps){
							if(err){
								logger.error(err);
							}else{
								acquireLockAndPush(key, reps);
							}
						});
					});
				}
			});
			
			setTimeout(ref.run, interval);
		}
	};
};

module.exports = GoalVisitsPushWorker;