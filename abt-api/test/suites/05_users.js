var vows = require('vows'),
	assert = require('assert');
var testUtils = require('../utils');
var codes = require('../../lib/codes');
var client = require('../../clients/users_client');

var id;
vows.describe("The users API")
.addBatch({
	'A POST on User' : {
		topic : function(){
			client.create({
				email : 'xyz@abc.com',
				password : 'abcdef'
			},this.callback);
		},
		'should create an User' : testUtils.assertSuccess,
		'should have an Id' : function(err, res){
			id = res.body.data.id;
			assert.isNotNull(id);
		},
		'should not be verified' : function(err, res){
			assert.isFalse(res.body.data.isVerified);
		},
		'with same email' : {
			topic : function(){
				client.create({
					email : 'xyz@abc.com',
					password : 'abcdef'
				},this.callback);
			},
			'should fail with an error' : testUtils.assertFailure(codes.error.USER_EMAIL_EXISTS)
		},
		'with different invalid email' : {
			topic : function(){
				client.create({
					email : 'abcde',
					password : 'abcdef'
				},this.callback);
			},
			'should fail with an error' : testUtils.assertFailure(codes.error.CREATION_FAILED)
		},
		'without password' : {
			topic : function(){
				client.create({
					email : 'abcd'
				},this.callback);
			},
			'should fail with an error' : testUtils.assertFailure(codes.error.FIELD_REQUIRED)
		}
	}
}).addBatch({
	'A GET on User with Id' : {
		topic : function(){
			client.getById(id,this.callback);
		},
		'should fetch the user' : testUtils.assertSuccess,
		'should have the same id' : function(err, res){
			assert.equal(JSON.parse(res.body).data.id, id);
		},
		'should not contain the password' : function(err, res){
			assert.isNull(JSON.parse(res.body).data.password);
		}
	},
	'A GET on User with Non Existent Id' : {
		topic : function(){
			client.getById(1000,this.callback);
		},
		'should fail with an error' : testUtils.assertFailure(codes.error.RECORD_WITH_ID_NOT_EXISTS)
	}
}).addBatch({
	'A PUT on User with Id' : {
		topic : function(){
			client.update(id, {password : 'abcpqr', isVerified : true}, this.callback);
		},
		'should update the user' : testUtils.assertSuccess,
		'should have the same id' : function(err, res){
			assert.equal(res.body.data.id, id);
		},
		'should have the updated values' : function(err, res){
			assert.isTrue(res.body.data.isVerified);
		}
	},
	'A PUT on User with Non Existent Id' : {
		topic : function(){
			client.update(1000, {password : 'abcpqr', isVerified : true}, this.callback);
		},
		'should fail with an error' : testUtils.assertFailure(codes.error.RECORD_WITH_ID_NOT_EXISTS)
	},
	'A PUT on User with Id and different email' : {
		topic : function(){
			client.update(id, {email : 'tata@xyz.com'}, this.callback);
		},
		'should fail with an error' : testUtils.assertFailure(codes.error.USER_EMAIL_CANT_BE_CHANGED)
	},
}).addBatch({
	'A POST on User authenticate' : {
		topic : function(){
			client.authenticate('xyz@abc.com', 'abcpqr', this.callback);
		},
		'should authenticate the user' : testUtils.assertSuccess,
	},
	'A PUT on User authenticate with empty email' : {
		topic : function(){
			client.authenticate(null, 'abcpqr', this.callback);
		},
		'should fail with an error' : testUtils.assertFailure(codes.error.EMAIL_OR_PASSWORD_NULL)
	},
	'A PUT on User authenticate with empty password' : {
		topic : function(){
			client.authenticate('xyz@abc.com', null, this.callback);
		},
		'should fail with an error' : testUtils.assertFailure(codes.error.EMAIL_OR_PASSWORD_NULL)
	},
	'A PUT on User authenticate with wrong email and password combination' : {
		topic : function(){
			client.authenticate('tata@xyz.com', 'abcpqr', this.callback);
		},
		'should fail with an error' : testUtils.assertFailure(codes.error.EMAIL_OR_PASSWORD_INCORRECT)
	},
})
.export(module);