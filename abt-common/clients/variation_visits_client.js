var comb = require('comb');
var request = require('request');
var client = require('./client.js');
var logger = require(LIB_DIR + 'log_factory').create("variation_visits_client");

var VariationVisitsClient = comb.define(client,{
	instance : {
		constructor : function(options){
			options = options || {};
			options.url = "variation_visits";
            this._super([options]);
		}		
	}
});

module.exports = new VariationVisitsClient();
