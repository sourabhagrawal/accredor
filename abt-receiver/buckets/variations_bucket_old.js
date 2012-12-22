var logger = require(LIB_DIR + 'log_factory').create("variations_bucket");
var comb = require("comb");
var _ = require('underscore');
var Bucket = require('./bucket');
var redis = require("redis");

var VariationsBucket = comb.define(Bucket, {
	instance : {
		constructor : function(options){
			options = options || {};
			
			this.experimentId = options.experimentId;
			this.variationId = options.variationId;
			
			this._super(arguments);
		},
		
		/**
		 * 
		 * @param channel
		 * @param message
		 * @returns {Array}
		 */
		filter : function(channel, message){
			var ref = this;
			var tokens = message.split('__');
			
			var values = [];
			if(channel == CHANNEL_VARIATIONS){// message Will be something like : 1000:1200__1001:4000 where 1000 and 1001 are experiement ids, 1200 and 4000 are variation_ids
				_.each(tokens, function(token){
					if(token == ref.experimentId + ":" + ref.variationId){
						logger.info("Matched variation id : " + ref.variationId);
						
						values.push({
							experimentId : ref.experimentId,
							variationId : ref.variationId
						});
					} 
				});
			}else if(channel == CHANNEL_GOALS){  // message Will be something like : 100:1000:1200__100:1001:4000 where 100 is the goal id, 1000 and 1001 are experiement ids, , 1200 and 4000 are variation_ids
				_.each(tokens, function(token){
					var gTokens = token.split(':');
					if(gTokens.length == 3 && gTokens[1] == ref.experimentId && gTokens[2] == ref.variationId){
						logger.info("Matched variation id : " + ref.variationId);
						
						var goalId = gTokens[0]; // first gToken is goal id
						
						values.push({
							experimentId : ref.experimentId,
							variationId : ref.variationId,
							goalId : goalId
						});
					} 
				});
			}
			return values;
		},
		
		process : function(channel, values){
			var ref = this;
			if(values){
				if(channel == CHANNEL_VARIATIONS){ // mark the total field
					_.each(values, function(value){
						var key = "v:" + value.variationId;
						
						ref.client.hincrby(key, 'total', 1, function(err, reply){
							console.log(reply);
						});
					});
				}else if(channel == CHANNEL_GOALS){ // mark the goal hit
					_.each(values, function(value){
						var key = "v:" + value.variationId; //e.g. v:1001
						var field = "g:" + value.goalId; // e.g. g:1004
						
						ref.client.hincrby(key, field, 1, function(err, reply){
							console.log(reply);
						});
					});
				}
			}
		}
	}
});

module.exports = VariationsBucket;