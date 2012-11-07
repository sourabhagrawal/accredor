var vows = require('vows');
var testUtils = require('./utils');
var codes = require('../lib/codes');
var client = require('../clients/experiments_client');

vows.describe("The experiments API")
.addBatch({
	'A POST on Experiment' : {
		topic : function(){
			client.create({
				userId : 1,
				name : 'abcde'
			},this.callback);
		},
		'should create an Experiment' : testUtils.assertSuccess,
		'with same User Id and Name' : {
			topic : function(){
				client.create({
					userId : 1,
					name : 'abcde'
				},this.callback);
			},
			'should fail with an error' : testUtils.assertFailure(codes.error.EXPERIMENT_USER_ID_NAME_EXISTS),
		},
		'with different User Id and same Name' : {
			topic : function(){
				client.create({
					userId : 2,
					name : 'abcde'
				},this.callback);
			},
			'should create an Experiment' : testUtils.assertSuccess,
		},
		'with same User Id and different Name' : {
			topic : function(){
				client.create({
					userId : 1,
					name : 'abcd'
				},this.callback);
			},
			'should create an Experiment' : testUtils.assertSuccess,
		}
	}
}).addBatch({
	'An GET on Experiment with Id' : {
		topic : function(){
			client.getById(1,this.callback);
		},
		'should fetch the experiment' : testUtils.assertSuccess
	}
})
.export(module);