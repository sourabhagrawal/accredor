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
						var experimentId = value.experimentId;
						var variationId = value.variationId;;
						var key = "e:" + experimentId + "__v:" + variationId;
						ref.locknIncrement(key, 'visits');
					});
				}else if(channel == CHANNEL_GOALS){ // mark the goal hit
					_.each(values, function(value){
						var key = "g:" + value.goalId + "__e:" + value.experimentId +  "__v:" + value.variationId;
						ref.locknIncrement(key, 'hits');
					});
				}
			}
		}
	}
});

module.exports = VariationsBucket;