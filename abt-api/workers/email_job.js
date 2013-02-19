var comb = require('comb');
var logger = require(LIB_DIR + 'log_factory').create("emails_job");
var EmailWorker = require('./email_worker');
var emitter = require(LIB_DIR + 'emitter');

var EmailJob = new function(){
	var worker = new EmailWorker();
	
	emitter.on('modelsSynced', function(){
		worker.run();
	});
};
