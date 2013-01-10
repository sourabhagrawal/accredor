var comb = require('comb');
var request = require('request');
var client = require('./client.js');
var logger = require(LIB_DIR + 'log_factory').create("experiment_visits_client");

var ExperimentVisitsClient = comb.define(client,{
	instance : {
		constructor : function(options){
			options = options || {};
			options.url = "experiment_visits";
            this._super([options]);
		}		
	}
});

module.exports = new ExperimentVisitsClient();
