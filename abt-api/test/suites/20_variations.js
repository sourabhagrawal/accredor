var vows = require('vows'),
	assert = require('assert');
var testUtils = require('../utils');
var constants = require('../../lib/constants');
var codes = require(LIB_DIR + 'codes');
var client = require(CLIENTS_DIR + 'variations_client');

var id;
vows.describe("The variations API")
.addBatch({
	'A POST on Variation' : {
		topic : function(){
			client.create({
				experimentId : 1,
				name : 'abcde',
				type : VARIATION_TYPE_URL
			},this.callback);
		},
		'should create an Variation' : testUtils.assertSuccess,
		'should have an Id' : function(err, res){
			id = res.body.data.id;
		},
		'with same User Id and Name' : {
			topic : function(){
				client.create({
					experimentId : 1,
					name : 'abcde',
					type : VARIATION_TYPE_URL
				},this.callback);
			},
			'should fail with an error' : testUtils.assertFailure(codes.error.VARIATION_EXPERIMENT_ID_NAME_EXISTS)
		},
		'with different User Id and same Name' : {
			topic : function(){
				client.create({
					experimentId : 2,
					name : 'abcde',
					type : VARIATION_TYPE_URL
				},this.callback);
			},
			'should create an Variation' : testUtils.assertSuccess,
		},
		'with same User Id and different Name' : {
			topic : function(){
				client.create({
					experimentId : 1,
					name : 'abcd',
					type : VARIATION_TYPE_URL
				},this.callback);
			},
			'should create an Variation' : testUtils.assertSuccess,
		}
	}
}).addBatch({
	'A GET on Variation with Id' : {
		topic : function(){
			client.getById(id,this.callback);
		},
		'should fetch the variations' : testUtils.assertSuccess,
		'should have the same id' : function(err, res){
			assert.equal(JSON.parse(res.body).data.id, id);
		}
	},
	'A GET on Variation with Non Existent Id' : {
		topic : function(){
			client.getById(1000,this.callback);
		},
		'should fail with an error' : testUtils.assertFailure(codes.error.RECORD_WITH_ID_NOT_EXISTS)
	}
}).addBatch({
	'A PUT on Variation with Id' : {
		topic : function(){
			client.update(id, {name : 'abc'}, this.callback);
		},
		'should update the variations' : testUtils.assertSuccess,
		'should have the same id' : function(err, res){
			assert.equal(res.body.data.id, id);
		},
		'should have the updated values' : function(err, res){
			assert.equal(res.body.data.name, 'abc');
		}
	},
	'A PUT on Variation with Non Existent Id' : {
		topic : function(){
			client.update(1000, {name : 'abc'}, this.callback);
		},
		'should fail with an error' : testUtils.assertFailure(codes.error.RECORD_WITH_ID_NOT_EXISTS)
	},
	'A PUT on Variation with redundant Experiment Id and name' : {
		topic : function(){
			client.update(id, {name : 'abcd'}, this.callback);
		},
		'should fail with an error' : testUtils.assertFailure(codes.error.VARIATION_EXPERIMENT_ID_NAME_EXISTS)
	},
})
.export(module);