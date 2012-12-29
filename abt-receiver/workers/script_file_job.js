var comb = require('comb');
var logger = require(LIB_DIR + 'log_factory').create("script_file_job");
var ScriptFileWorker = require('./script_file_worker');

var ScriptFileJob = new function(){
	var worker = new ScriptFileWorker();
	worker.run();
};