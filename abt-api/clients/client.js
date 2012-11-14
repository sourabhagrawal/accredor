var comb = require('comb');
var request = require('request');
var constants = require('../lib/constants');
var logger = require(LIB_DIR + 'log_factory').create("route");

var Client = comb.define(null,{
	instance : {
		host : 'http://localhost:10001/',
		auth : 'Basic dGVzdF91c2VyOnRlc3RfcGFzcwo=',
		constructor : function(options){
			options = options || {};
			this._super(arguments);
			
            this.url = options.url;
		},

		getById : function(id, callback){
			request({
				uri : this.host + this.url + '/' + id,
				headers : {
					authorization : this.auth
				}
			}, callback);
		},
		
		create : function(params, callback){
			request({
				uri : this.host + this.url,
				method : 'post',
				headers : {
					authorization : this.auth
				},
				json : params
			}, callback);
		},
		
		update : function(id, params, callback){
			request({
				uri : this.host + this.url + '/' + id,
				method : 'put',
				headers : {
					authorization : this.auth
				},
				json : params
			}, callback);
		},
		
		search : function(query, start, fetchSize, sortBy, sortDir){
			request({
				uri : this.host + this.url,
				headers : {
					authorization : this.auth
				},
				qs : {
					q : query,
					start : start,
					fetchSize : fetchSize,
					sortBy : sortBy,
					sortDir : sortDir
				}
			}, callback);
		}
	}
});

module.exports = Client;