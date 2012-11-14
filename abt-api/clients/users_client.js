var comb = require('comb');
var client = require('./client.js');
var logger = require(LIB_DIR + 'log_factory').create("users_client");

var UsersClient = comb.define(client,{
	instance : {
		constructor : function(options){
			options = options || {};
			options.url = "users";
            this._super([options]);
		}
	}
});

module.exports = new UsersClient();
