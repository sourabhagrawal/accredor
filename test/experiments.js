var vows = require('vows'),
    assert = require('assert'),
    request = require('request'),
    _ = require('underscore');
var client = require('../clients/experiments_client');

var assertSuccess = function(err, res){
	assert.isNull(err);
	
	var body = res.body;
	if(!_.isObject(body))
		body = JSON.parse(body);
	assert.isObject(body);
	assert.isObject(body.status);
	assert.equal(body.status.code, 1000);
};

vows.describe("The experiments API")
.addBatch({
	'An Experiment' : {
		topic : function(){
			client.create({
				userId : 1,
				name : 'abcd'
			},this.callback);
		},
		'should be created' : assertSuccess
	}
}).addBatch({
	'An Experiment' : {
		topic : function(){
			client.getById(1,this.callback);
		},
		'should be fetched' : assertSuccess
	}
})
.export(module);