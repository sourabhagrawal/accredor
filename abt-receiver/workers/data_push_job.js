var comb = require('comb');
var logger = require(LIB_DIR + 'log_factory').create("data_push_job");
var DataPushWorker = require('./data_push_worker');

var DataPushJob = new function(){
	var worker = new DataPushWorker();
	worker.run();
};