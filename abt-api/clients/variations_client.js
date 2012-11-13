var comb = require('comb');
var client = require('./client.js');
var logger = require(LIB_DIR + 'log_factory').create("variations_client");

var VariationsClient = comb.define(client,{
	instance : {
		constructor : function(options){
			options = options || {};
			options.url = "variations";
            this._super([options]);
		}
	}
});

module.exports = new VariationsClient();
