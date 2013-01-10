var logger = require(LIB_DIR + 'log_factory').create("bucket");
var redis = require("redis");
var comb = require("comb");
var _ = require("underscore");
var Lock = require(LIB_DIR + 'lock');

/**
 * NOTE : May be its a misnomer.
 * 
 * Bucket is something which subscribes to a channel, filters the message and pushes some value in redis
 * I named it Bucket because it filters and holds some data :P
 */
var Bucket = comb.define(null, {
	instance : {
		constructor : function(options){
			options = options || {};
			this._super(arguments);
			
			this.client = redis.createClient();
			
			this.channels = [CHANNEL_VARIATIONS, CHANNEL_GOALS];
			this.subscribe();
			
			this.addBuckets();
		},
		
		subscribe : function(){
			var ref = this;
			
			if(this.channels){
				_.each(this.channels, function(channel){
					var client = redis.createClient();
					client.subscribe(channel);
					client.on("message", function(channel, message){
						var values = ref.filter(channel, message);
						if(values != null){
							ref.process(channel, values);
						}
					});
				});
			}
		},
		
		/**
		 * Add Sub-Buckets
		 */
		addBuckets : function(){},
		
		/**
		 * 
		 * @param channel
		 * @param message
		 * @returns {Array}
		 */
		filter : function(channel, message){
			var tokens = message.split('__');
			
			var values = [];
			
			if(channel == CHANNEL_VARIATIONS){
				/*
				 * message Will be something like : 
				 * 1000:2000:100:101__1001:4000:100:101 
				 * where 1000 and 1001 are experiement ids
				 * 2000 and 4000 are variation ids
				 * 100 and 101 are goals ids
				 */ 
				_.each(tokens, function(token){
					logger.trace("Variation Channel, token : " + token);
					var exTokens = token.split(':');
					if(exTokens.length >= 2){ 
						var experimentId = exTokens[0]; // first exToken must be experiment id
						var variationId = exTokens[1]; // second exToken is variation id
						var goalIds = exTokens.splice(2);
						
						values.push({
							experimentId : experimentId,
							variationId : variationId,
							goalIds : goalIds
						});
					} 
				});
			}else if(channel == CHANNEL_GOALS){ 
				/*
				 * message Will be something like : 
				 * 100:1000:2000__100:1001:4000 
				 * where 100 is the goal id, 
				 * 1000 and 1001 are experiement ids
				 * 2000 and 4000 are variation ids
				 */ 
				_.each(tokens, function(token){
					logger.trace("Goal Channel, token : " + token);
					var gTokens = token.split(':');
					if(gTokens.length == 3){
						var goalId = gTokens[0]; // first gToken is goal id
						var experimentId = gTokens[1]; // second exToken must be experiment id
						var variationId = gTokens[2]; // third exToken is variation id
						
						values.push({
							experimentId : experimentId,
							goalId : goalId,
							variationId : variationId
						});
					} 
				});
			}
			return values;
		},
		
		locknIncrement : function(key, field){
			var ref = this;
			
			var lockKey = key + ':' + field;
			logger.trace("Aquiring lock on " + lockKey);
			
			Lock.acquire(lockKey, (new Date().getTime() + Lock.lockTimeOut + 1), 
					function(err, reply){
				if(err){
					logger.error(err);
				}else{
					logger.info("Lock Aquisition status for key : " + lockKey + " : " + reply);
					ref.client.hincrby(key, field, 1, function(err, reply){
						if(err){
							logger.error(err);
						}else
							logger.info(key + " " + field + " : " + reply);
						
						Lock.release(lockKey, function(err, reply){
							if(err){
								logger.error(err);
							}
						});
					});
				}
			});
		},
		
		/**
		 * TODO : Store the values in Redis
		 */
		process : function(channel, values){}
	}
});

module.exports = Bucket;
	
