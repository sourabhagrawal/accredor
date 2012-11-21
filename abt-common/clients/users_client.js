var comb = require('comb');
var request = require('request');
var client = require('./client.js');
var logger = require(LIB_DIR + 'log_factory').create("users_client");

var UsersClient = comb.define(client,{
	instance : {
		constructor : function(options){
			options = options || {};
			options.url = "users";
            this._super([options]);
		},
		
		authenticate : function(username, password, callback){
			request({
				uri : this.host + this.url + '/authenticate',
				method : 'post',
				headers : {
					authorization : this.auth
				},
				json : {
					username : username,
					password : password
				}
			}, callback);
		}
	}
});

module.exports = new UsersClient();
