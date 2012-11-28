var vows = require('vows'),
	assert = require('assert');
var testUtils = require('../utils');
var constants = require(LIB_DIR + 'constants');
var codes = require(LIB_DIR + 'codes');
var client = require(CLIENTS_DIR + 'experiments_client');

var id;
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
		'should have an Id' : function(err, res){
			id = res.body.data.id;
		},
		'with same User Id and Name' : {
			topic : function(){
				client.create({
					userId : 1,
					name : 'abcde'
				},this.callback);
			},
			'should fail with an error' : testUtils.assertFailure(codes.error.EXPERIMENT_USER_ID_NAME_EXISTS)
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
	'A GET on Experiment with Id' : {
		topic : function(){
			client.getById(id,this.callback);
		},
		'should fetch the experiment' : testUtils.assertSuccess,
		'should have the same id' : function(err, res){
			assert.equal(JSON.parse(res.body).data.id, id);
		}
	},
	'A GET on Experiment with Non Existent Id' : {
		topic : function(){
			client.getById(1000,this.callback);
		},
		'should fail with an error' : testUtils.assertFailure(codes.error.RECORD_WITH_ID_NOT_EXISTS)
	}
}).addBatch({
	'A PUT on Experiment with Id' : {
		topic : function(){
			client.update(id, {name : 'abc'}, this.callback);
		},
		'should update the experiment' : testUtils.assertSuccess,
		'should have the same id' : function(err, res){
			assert.equal(res.body.data.id, id);
		},
		'should have the updated values' : function(err, res){
			assert.equal(res.body.data.name, 'abc');
		}
	},
	'A PUT on Experiment with Non Existent Id' : {
		topic : function(){
			client.update(1000, {name : 'abc'}, this.callback);
		},
		'should fail with an error' : testUtils.assertFailure(codes.error.RECORD_WITH_ID_NOT_EXISTS)
	},
	'A PUT on Experiment with Id and reduntant name' : {
		topic : function(){
			client.update(id, {name : 'abcd'}, this.callback);
		},
		'should fail with an error' : testUtils.assertFailure(codes.error.EXPERIMENT_USER_ID_NAME_EXISTS)
	},
})
.export(module);