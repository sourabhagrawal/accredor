var comb = require('comb');
var request = require('request');
var client = require('./client.js');
var logger = require(LIB_DIR + 'log_factory').create("experiments_client");

var ExperimentsClient = comb.define(client,{
	instance : {
		constructor : function(options){
			options = options || {};
			options.url = "experiments";
            this._super([options]);
		},
		
		createSplitExperiment : function(params, callback){
			request({
				uri : this.host + this.url + '/split_experiment',
				method : 'post',
				headers : {
					authorization : this.auth
				},
				json : params
			}, callback);
		},
		
		updateSplitExperiment : function(id, params, callback){
			request({
				uri : this.host + this.url + '/split_experiment/' + id,
				method : 'put',
				headers : {
					authorization : this.auth
				},
				json : params
			}, callback);
		},
		
		getSplitExperimentById : function(id, callback){
			request({
				uri : this.host + this.url + '/split_experiment/' + id,
				headers : {
					authorization : this.auth
				}
			}, callback);
		}
	}
});

module.exports = new ExperimentsClient();
