var vows = require('vows'),
	assert = require('assert');
var testUtils = require('../utils');
var codes = require('../../lib/codes');
var client = require('../../clients/links_client');

var id;
vows.describe("The links API")
.addBatch({
	'A POST on Link' : {
		topic : function(){
			client.create({
				experimentId : 1,
				url : 'http://google.com'
			},this.callback);
		},
		'should create an Link' : testUtils.assertSuccess,
		'should have an Id' : function(err, res){
			id = res.body.data.id;
		}
	}
}).addBatch({
	'A GET on Link with Id' : {
		topic : function(){
			client.getById(id,this.callback);
		},
		'should fetch the links' : testUtils.assertSuccess,
		'should have the same id' : function(err, res){
			assert.equal(JSON.parse(res.body).data.id, id);
		}
	},
	'A GET on Link with Non Existent Id' : {
		topic : function(){
			client.getById(1000,this.callback);
		},
		'should fail with an error' : testUtils.assertFailure(codes.error.RECORD_WITH_ID_NOT_EXISTS)
	}
}).addBatch({
	'A PUT on Link with Id' : {
		topic : function(){
			client.update(id, {url : 'http://yahoo.com'}, this.callback);
		},
		'should update the links' : testUtils.assertSuccess,
		'should have the same id' : function(err, res){
			assert.equal(res.body.data.id, id);
		},
		'should have the updated values' : function(err, res){
			assert.equal(res.body.data.url, 'http://yahoo.com');
		}
	},
	'A PUT on Link with Non Existent Id' : {
		topic : function(){
			client.update(1000, {url : 'http://google.com'}, this.callback);
		},
		'should fail with an error' : testUtils.assertFailure(codes.error.RECORD_WITH_ID_NOT_EXISTS)
	}
})
.export(module);