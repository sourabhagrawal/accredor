var comb = require('comb');
var client = require('./client.js');
var logger = require(LIB_DIR + 'log_factory').create("script_details_client");

var ScriptDetailsClient = comb.define(client,{
	instance : {
		constructor : function(options){
			options = options || {};
			options.url = "script_details";
            this._super([options]);
		}
	}
});

module.exports = new ScriptDetailsClient();
