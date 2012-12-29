var comb = require('comb');
var request = require('request');
var client = require('./client.js');
var logger = require(LIB_DIR + 'log_factory').create("contact_leads_client");

var ContactLeadsClient = comb.define(client,{
	instance : {
		constructor : function(options){
			options = options || {};
			options.url = "contact_leads";
            this._super([options]);
		}		
	}
});

module.exports = new ContactLeadsClient();
