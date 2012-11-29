var logger = require(LIB_DIR + 'log_factory').create("variations_receiver");
var _ = require("underscore");

var ExperimentsBucket = require(BUCKETS_DIR + 'experiments_bucket');
var ExperimentsClient = require(CLIENTS_DIR + 'experiments_client');

/**
 * Initializes buckets for all the experiments
 */
var Subscriber = function(){
	var createBucket = function(experiment){
		var experimentId = experiment.id;
		if(experimentId){
			logger.debug("creating new experiment bucket for ex : " + experimentId);
			new ExperimentsBucket({experimentId : experimentId});
		}
	};
	
	this.init = function(){
		/**
		 * Fetch all the experiments from api
		 * 
		 * For each experiment, create a bucket.
		 */
		ExperimentsClient.search(function(err, response){
			console.log(_.isString(response.body));
			if(response.body){
				var body = JSON.parse(response.body);
				if(body.status && body.status.code == 1000){
					var data = body.data;
					if(data){
						if(_.isArray(data)){
							_.each(data, function(experiment){
								createBucket(experiment);
							});
						}else{
							createBucket(data);
						}
					}
				}else{
					logger.fatal("Failed to fetch experiments : can not continue");
				}
			}else{
				logger.fatal("Failed to fetch experiments : can not continue");
			}
		},'');
	};
};

module.exports = new Subscriber();
