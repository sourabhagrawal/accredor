var CONFIG = require('config');
var log4js = require('log4js');
log4js.configure(CONFIG.log);

exports.create = function(path){
	var logger = log4js.getLogger(path);
	return logger;
};