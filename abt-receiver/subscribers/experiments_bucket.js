var logger = require(LIB_DIR + 'log_factory').create("experiments_bucket");
var comb = require("comb");
var _ = require('underscore');
var Bucket = require('./bucket');
var redis = require("redis");

var VariationsBucket = require('./variations_bucket');

var ExperimentsBucket = comb.define(Bucket, {
	instance : {
		constructor : function(options){
			options = options || {};
			
			this.experimentId = options.experimentId;
			
			this._super(arguments);
		},
		
		filter : function(channel, message){
			var ref = this;
			var tokens = message.split('__');
			
			var values = [];
			if(channel == CHANNEL_VARIATIONS){
				_.each(tokens, function(token){
					if(token.indexOf(ref.experimentId) == 0){
						logger.info("Matched experiment id : " + ref.experimentId);
						
						var exTokens = token.split(':');
						if(exTokens.length == 2){
							var variationId = exTokens[1];
							
							values.push({
								experimentId : ref.experimentId,
								variationId : variationId
							});
						}
					} 
				});
			}else if(channel == CHANNEL_GOALS){
				_.each(tokens, function(token){
					if(token.indexOf(ref.experimentId) == 0){
						logger.info("Matched experiment id : " + ref.experimentId);
						
						var exTokens = token.split(':');
						if(exTokens.length > 1){
							var goalId = exTokens[1];
							
							values.push({
								experimentId : ref.experimentId,
								goalId : goalId
							});
						}
					} 
				});
			}
			return values;
		},
		
		process : function(channel, values){
			var ref = this;
			if(values){
				if(channel == CHANNEL_VARIATIONS){
					_.each(values, function(value){
						var key = "ex:" + value.experimentId;
						
						ref.client.hincrby(key, 'total', 1, function(err, reply){
							console.log(reply);
						});
					});
				}else if(channel == CHANNEL_GOALS){
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
			new VariationsBucket({experimentId : this.experimentId, variationId : 1, channel : 'variations'});
		}
	}
});

module.exports = ExperimentsBucket;