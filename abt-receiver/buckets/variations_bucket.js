var logger = require(LIB_DIR + 'log_factory').create("variations_bucket");
var comb = require("comb");
var _ = require('underscore');
var Bucket = require('./bucket');

var VariationsBucket = comb.define(Bucket, {
	instance : {
		constructor : function(options){
			options = options || {};
			
			this._super(arguments);
		},
		
		process : function(channel, values){
			var ref = this;
			if(values){
				if(channel == CHANNEL_VARIATIONS){ // mark the total field
					_.each(values, function(value){
						var key = "v:" + value.variationId;
						
						ref.client.hincrby(key, 'total', 1, function(err, reply){
							if(err){
								logger.error(err);
							}else
								logger.info("v:" + value.variationId + " total : " + reply);
						});
					});
				}else if(channel == CHANNEL_GOALS){ // mark the goal hit
					_.each(values, function(value){
						var key = "v:" + value.variationId; //e.g. v:1001
						var field = "g:" + value.goalId; // e.g. g:1004
						
						ref.client.hincrby(key, field, 1, function(err, reply){
							if(err){
								logger.error(err);
							}else
								logger.info("v:" + value.variationId + " g:" + value.goalId + " : " + reply);
						});
					});
				}
			}
		}
	}
});

module.exports = VariationsBucket;