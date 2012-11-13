var comb = require('comb');
var client = require('./client.js');
var logger = require(LIB_DIR + 'log_factory').create("experiments_client");

var ExperimentsClient = comb.define(client,{
	instance : {
		constructor : function(options){
			options = options || {};
			options.url = "experiments";
            this._super([options]);
		}
	}
});

module.exports = new ExperimentsClient();
