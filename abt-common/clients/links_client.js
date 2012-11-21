var comb = require('comb');
var client = require('./client.js');
var logger = require(LIB_DIR + 'log_factory').create("links_client");

var LinksClient = comb.define(client,{
	instance : {
		constructor : function(options){
			options = options || {};
			options.url = "links";
            this._super([options]);
		}
	}
});

module.exports = new LinksClient();
