var comb = require('comb');
var logger = require(LIB_DIR + 'log_factory').create("data_push_job");
var ExperimentVisitsPushWorker = require('./experiment_visits_push_worker');
var GoalVisitsPushWorker = require('./goal_visits_push_worker');

var DataPushJob = new function(){
	var worker = new ExperimentVisitsPushWorker();
	worker.run();
	
	worker = new GoalVisitsPushWorker();
	worker.run();
};