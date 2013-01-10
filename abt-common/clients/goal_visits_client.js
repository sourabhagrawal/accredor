var comb = require('comb');
var request = require('request');
var client = require('./client.js');
var logger = require(LIB_DIR + 'log_factory').create("goal_visits_client");

var GoalVisitsClient = comb.define(client,{
	instance : {
		constructor : function(options){
			options = options || {};
			options.url = "goal_visits";
            this._super([options]);
		}		
	}
});

module.exports = new GoalVisitsClient();
