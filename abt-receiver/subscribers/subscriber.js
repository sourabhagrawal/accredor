var logger = require(LIB_DIR + 'log_factory').create("variations_receiver");

var ExperimentsBucket = require(BUCKETS_DIR + 'experiments_bucket');
var VariationsBucket = require(BUCKETS_DIR + 'variations_bucket');
var GoalsBucket = require(BUCKETS_DIR + 'goals_bucket');

/**
 * Initializes buckets for all the experiments
 */
var Subscriber = function(){
	this.init = function(){
		new ExperimentsBucket();
		new VariationsBucket();
		new GoalsBucket();
		
		logger.info("Initialized buckets");
	};
};

module.exports = new Subscriber();
