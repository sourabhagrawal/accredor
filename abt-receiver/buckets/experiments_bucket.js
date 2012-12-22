var logger = require(LIB_DIR + 'log_factory').create("experiments_bucket");
var comb = require("comb");
var _ = require('underscore');
var Bucket = require('./bucket');

var ExperimentsBucket = comb.define(Bucket, {
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
						var key = "ex:" + value.experimentId;
						ref.client.hincrby(key, 'total', 1, function(err, reply){
							if(err){
								logger.error(err);
							}else
								logger.info("ex:" + value.experimentId + " total : " + reply);
						});
					});
				}else if(channel == CHANNEL_GOALS){ // mark the goal hit
					console.log(values);
					_.each(values, function(value){
						var key = "ex:" + value.experimentId;
						var field = "g:" + value.goalId;
						
						ref.client.hincrby(key, field, 1, function(err, reply){
							if(err){
								logger.error(err);
							}else
								logger.info("ex:" + value.experimentId + " g:" + value.goalId + " : " + reply);
						});
					});
				}
			}
		},
	}
});

module.exports = ExperimentsBucket;