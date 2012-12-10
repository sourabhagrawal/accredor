var comb = require('comb');
var client = require('./client.js');
var logger = require(LIB_DIR + 'log_factory').create("goals_client");

var GoalsClient = comb.define(client,{
	instance : {
		constructor : function(options){
			options = options || {};
			options.url = "goals";
            this._super([options]);
		}
	}
});

module.exports = new GoalsClient();
