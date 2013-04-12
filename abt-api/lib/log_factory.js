/**
 * Configure Log4JS for logging
 */

var CONFIG = require('config');
var log4js = require('log4js');
var _ = require('underscore');

log4js.configure(CONFIG.log);

var Logger = function(path){
	this.logger = log4js.getLogger(path);
	
	var ref = this;
	_.each(['trace', 'debug', 'info', 'warn', 'error', 'fatal'], function(level){
		ref[level] = function(log){
			ref.logger[level](log);
		};
	});
};

exports.create = function(path){
	return new Logger(path);
};