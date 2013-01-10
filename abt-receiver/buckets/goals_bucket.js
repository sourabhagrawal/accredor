var logger = require(LIB_DIR + 'log_factory').create("goals_bucket");
var comb = require("comb");
var _ = require('underscore');
var Bucket = require('./bucket');

var GoalsBucket = comb.define(Bucket, {
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
						var goalIds = value.goalIds;
						var experimentId = value.experimentId;
						var variationId = value.variationId;
						
						if(goalIds){
							_.each(goalIds, function(goalId){
								var keyG = "g:" + goalId;
								ref.locknIncrement(keyG, 'visits');
								
								var keyE = keyG + "__e:" + experimentId;
								ref.locknIncrement(keyE, 'visits');
								
								var keyV = keyE + "__v:" + variationId;
								ref.locknIncrement(keyV, 'visits');
							});
						}
					});
				}else if(channel == CHANNEL_GOALS){ // mark the goal hit
					_.each(values, function(value){
						var key = "g:" + value.goalId;
						ref.locknIncrement(key, 'hits');
					});
				}
			}
		},
	}
});

module.exports = GoalsBucket;