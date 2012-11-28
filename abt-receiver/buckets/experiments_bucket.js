var logger = require(LIB_DIR + 'log_factory').create("experiments_bucket");
var comb = require("comb");
var _ = require('underscore');
var Bucket = require('./bucket');
var redis = require("redis");

var VariationsBucket = require('./variations_bucket');
var VariationsClient = require(CLIENTS_DIR + 'variations_client');

var ExperimentsBucket = comb.define(Bucket, {
	instance : {
		constructor : function(options){
			options = options || {};
			
			this.experimentId = options.experimentId;
			this.variations = options.variations;
			
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
			if(channel == CHANNEL_VARIATIONS){ // message Will be something like : 1000:1200__1001:4000 where 1000 and 1001 are experiement ids
				_.each(tokens, function(token){
					var exTokens = token.split(':');
					if(exTokens.length == 2 && exTokens[0] == ref.experimentId){ // first exToken must be experiment id
						logger.info("Matched experiment id : " + ref.experimentId);
						
						var variationId = exTokens[1]; // second exToken is variation id
						
						values.push({
							experimentId : ref.experimentId,
							variationId : variationId
						});
					} 
				});
			}else if(channel == CHANNEL_GOALS){ // message Will be something like : 100:1000:1200__100:1001:4000 where 100 is the goal id, 1000 and 1001 are experiement ids
				_.each(tokens, function(token){
					var gTokens = token.split(':');
					if(gTokens.length == 3 && gTokens[1] == ref.experimentId){ // second gtoken must be experiment id
						logger.info("Matched experiment id : " + ref.experimentId);
						
						var goalId = gTokens[0]; // first gToken is goal id
						var variationId = gTokens[2]; // third exToken is variation id
						
						values.push({
							experimentId : ref.experimentId,
							goalId : goalId,
							variationId : variationId
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
						var key = "ex:" + value.experimentId;
						ref.client.hincrby(key, 'total', 1, function(err, reply){
							console.log(reply);
						});
					});
				}else if(channel == CHANNEL_GOALS){ // mark the goal hit
					_.each(values, function(value){
						var key = "ex:" + value.experimentId;
						var field = "g:" + value.goalId;
						
						ref.client.hincrby(key, field, 1, function(err, reply){
							console.log(reply);
						});
					});
				}
			}
		},
		
		addBuckets : function(){
			var ref = this;
			
			var createBucket = function(variation){
				var variationId = variation.id;
				
				if(variationId){
					logger.debug("creating new variation bucket for ex : " + ref.experimentId + " v : " + variationId);
					new VariationsBucket({experimentId : ref.experimentId, variationId : variationId});
				}
			};
			
			if(this.variations){
				_.each(this.variations, function(variation){
					createBucket(variation);
				});
			}else{
				VariationsClient.search(function(err, response){
					if(response.body){
						var body = JSON.parse(response.body);
						if(body.status && body.status.code == 1000){
							var data = body.data;
							if(data){
								if(_.isArray(data)){
									_.each(data, function(variation){
										createBucket(variation);
									});
								}else{
									createBucket(data);
								}
							}
						}else{
							logger.error("Failed to fetch variations for experiment : " + ref.experimentId);
						}
					}else{
						logger.error("Failed to fetch variations for experiment : " + ref.experimentId);
					}
				},'experimentId:eq:' + ref.experimentId);
			}
		}
	}
});

module.exports = ExperimentsBucket;