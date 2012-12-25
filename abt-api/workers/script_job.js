var comb = require('comb');
var logger = require(LIB_DIR + 'log_factory').create("script_job");
var ScriptWorker = require('./script_worker');
var emitter = require(LIB_DIR + 'emitter');

var ScriptJob = new function(){
	var worker = new ScriptWorker();
	
	emitter.on('modelsSynced', function(){
		worker.run();
	});
};