var comb = require('comb');
var client = require('./client.js');
var logger = require(LIB_DIR + 'log_factory').create("audits_client");

var AuditsClient = comb.define(client,{
	instance : {
		constructor : function(options){
			options = options || {};
			options.url = "audits";
            this._super([options]);
		}
	}
});

module.exports = new AuditsClient();
