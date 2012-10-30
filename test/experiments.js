var vows = require('vows'),
    assert = require('assert'),
    request = require('request');
var client = require('../clients/experiments_client');

var assertSuccess = function(err, res){
	assert.isNull(err);
	assert.isObject(res.body);
	assert.isObject(res.body.status);
	assert.equal(res.body.status.code, 1000);
};

vows.describe("The experiments API").addBatch({
	'An Experiment' : {
		topic : function(){
			client.create({
				userId : 1,
				name : 'abcd'
			},this.callback);
		},
		'should be created' : assertSuccess
	}
}).export(module);