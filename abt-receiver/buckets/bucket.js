var logger = require(LIB_DIR + 'log_factory').create("bucket");
var redis = require("redis");
var comb = require("comb");
var _ = require("underscore");

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
			if(channel == CHANNEL_VARIATIONS){ // message Will be something like : 1000:1200__1001:4000 where 1000 and 1001 are experiement ids
				_.each(tokens, function(token){
					var exTokens = token.split(':');
					if(exTokens.length == 2){ 
						var experimentId = exTokens[0]; // first exToken must be experiment id
						var variationId = exTokens[1]; // second exToken is variation id
						
						values.push({
							experimentId : experimentId,
							variationId : variationId
						});
					} 
				});
			}else if(channel == CHANNEL_GOALS){ // message Will be something like : 100:1000:1200__100:1001:4000 where 100 is the goal id, 1000 and 1001 are experiement ids
				_.each(tokens, function(token){
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
		
		/**
		 * TODO : Store the values in Redis
		 */
		process : function(channel, values){}
	}
});

module.exports = Bucket;
	
