var vows = require('vows'),
	assert = require('assert');
var testUtils = require('../utils');
var constants = require('../../lib/constants');
var codes = require(LIB_DIR + 'codes');
var client = require(CLIENTS_DIR + 'goals_client');
var entities = require(LIB_DIR + 'entities');

var id;
var id2;
vows.describe("The goals API")
.addBatch({
	'A POST on Goal' : {
		topic : function(){
			client.create({
				userId : 1,
				name : 'abcde',
				type : GOAL.types.VISIT,
				url : 'http://yahoo.com'
			},this.callback);
		},
		'should create an Goal' : testUtils.assertSuccess,
		'should have an Id' : function(err, res){
			id = res.body.data.id;
			assert.isNotNull(id);
		},
		'should have a status' : function(err, res){
			assert.isNotNull(res.body.data.status);
		},
		'should have an url' : function(err, res){
			assert.isNotNull(res.body.data.url);
		},
		'with same User Id and Name' : {
			topic : function(){
				client.create({
					userId : 1,
					name : 'abcde',
					type : GOAL.types.VISIT,
					url : 'http://yahoo.com'
				},this.callback);
			},
			'should fail with an error' : testUtils.assertFailure(codes.error.GOAL_USER_ID_NAME_EXISTS)
		},
		'with different User Id and same Name' : {
			topic : function(){
				client.create({
					userId : 2,
					name : 'abcde',
					type : GOAL.types.VISIT,
					url : 'http://yahoo.com'
				},this.callback);
			},
			'should create an Goal' : testUtils.assertSuccess,
			'should have an Id' : function(err, res){
				id2 = res.body.data.id;
			}
		},
		'with same User Id and different Name' : {
			topic : function(){
				client.create({
					userId : 1,
					name : 'abcd',
					type : GOAL.types.VISIT,
					url : 'http://yahoo.com'
				},this.callback);
			},
			'should create an Goal' : testUtils.assertSuccess,
		}
	}
}).addBatch({
	'A GET on Goal with Id' : {
		topic : function(){
			client.getById(id,this.callback);
		},
		'should fetch the goal' : testUtils.assertSuccess,
		'should have the same id' : function(err, res){
			assert.equal(JSON.parse(res.body).data.id, id);
		}
	},
	'A GET on Goal with Non Existent Id' : {
		topic : function(){
			client.getById(1000,this.callback);
		},
		'should fail with an error' : testUtils.assertFailure(codes.error.RECORD_WITH_ID_NOT_EXISTS)
	}
}).addBatch({
	'A PUT on Goal with Id' : {
		topic : function(){
			client.update(id, {name : 'abc'}, this.callback);
		},
		'should update the goal' : testUtils.assertSuccess,
		'should have the same id' : function(err, res){
			assert.equal(res.body.data.id, id);
		},
		'should have the updated values' : function(err, res){
			assert.equal(res.body.data.name, 'abc');
		}
	},
	'A PUT on Goal with Non Existent Id' : {
		topic : function(){
			client.update(1000, {name : 'abc'}, this.callback);
		},
		'should fail with an error' : testUtils.assertFailure(codes.error.RECORD_WITH_ID_NOT_EXISTS)
	},
	'A PUT on Goal with Id and different User Id' : {
		topic : function(){
			client.update(id, {userId : 2}, this.callback);
		},
		'should fail with an error' : testUtils.assertFailure(codes.error.GOAL_USER_ID_CANT_UPDATE)
	},
	'A PUT on Goal with Id and reduntant name' : {
		topic : function(){
			client.update(id, {name : 'abcd'}, this.callback);
		},
		'should fail with an error' : testUtils.assertFailure(codes.error.GOAL_USER_ID_NAME_EXISTS)
	}
})
.export(module);