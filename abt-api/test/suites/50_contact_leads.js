var vows = require('vows'),
	assert = require('assert');
var testUtils = require('../utils');
var constants = require('../../lib/constants');
var codes = require(LIB_DIR + 'codes');
var client = require(CLIENTS_DIR + 'contact_leads_client');

var id;
vows.describe("The contact leads API")
.addBatch({
	'A POST on Contact Leads' : {
		topic : function(){
			client.create({
				email : 'xyz@abc.com',
				name : 'some name',
				message : 'some message'
			},this.callback);
		},
		'should create a Lead' : testUtils.assertSuccess,
		'should have an Id' : function(err, res){
			id = res.body.data.id;
			assert.isNotNull(id);
		},
		'with invalid email' : {
			topic : function(){
				client.create({
					email : 'abcde',
					name : 'some name',
					message : 'some message'
				},this.callback);
			},
			'should fail with an error' : testUtils.assertFailure(codes.error.NOT_VALID_EMAIL)
		}
	}
}).addBatch({
	'A GET on Contact Leads with Id' : {
		topic : function(){
			client.getById(id,this.callback);
		},
		'should fetch the leads' : testUtils.assertSuccess,
		'should have the same id' : function(err, res){
			assert.equal(JSON.parse(res.body).data.id, id);
		}
	},
	'A GET on Contact Leads with Non Existent Id' : {
		topic : function(){
			client.getById(1000,this.callback);
		},
		'should fail with an error' : testUtils.assertFailure(codes.error.RECORD_WITH_ID_NOT_EXISTS)
	}
})
.export(module);