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
		
		filter : function(channel, message){
			var ref = this;
			var tokens = message.split('__');
			
			var values = [];
			if(channel == CHANNEL_VARIATIONS){
				_.each(tokens, function(token){
					if(token == ref.experimentId + ":" + ref.variationId){
						logger.info("Matched variation id : " + ref.variationId);
						
						values.push({
							experimentId : ref.experimentId,
							variationId : ref.variationId
						});
					} 
				});
			}else if(channel == CHANNEL_GOALS){
				_.each(tokens, function(token){
					if(token.indexOf(ref.experimentId + ":" + ref.variationId) == 0){
						logger.info("Matched variation id : " + ref.variationId);
						
						values.push({
							experimentId : ref.experimentId,
							variationId : ref.variationId
						});
					} 
				});
			}
			return values;
		},
		
		process : function(channel, values){
			var ref = this;
			if(values){
				_.each(values, function(value){
					var key = "v:" + value.variationId;
					
					ref.client.hincrby(key, 'total', 1, function(err, reply){
						console.log(reply);
					});
				});
			}
		}
	}
});

module.exports = VariationsBucket;