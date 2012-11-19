var logger = require(LIB_DIR + 'log_factory').create("variations_receiver");
var redis = require("redis");

var ExperimentsBucket = require('./experiments_bucket');

var Subscriber = function(){
	this.init = function(){
		/**
		 * Fetch all the experiments, variations, goals from api
		 * 
		 * For each experiment, create a bucket and pass the variations and goals.
		 */
		
		
		new ExperimentsBucket({experimentId : 1, channel : 'variations'});
		new ExperimentsBucket({experimentId : 2, channel : 'variations'});
	};
};

module.exports = new Subscriber();
