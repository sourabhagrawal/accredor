var vows = require('vows'),
	assert = require('assert');
var testUtils = require('../utils');
var constants = require('../../lib/constants');
var codes = require(LIB_DIR + 'codes');
var client = require(CLIENTS_DIR + 'users_client');

var id;
var id2;
vows.describe("The users API")
.addBatch({
	'A POST on User' : {
		topic : function(){
			client.create({
				email : 'xyz@abc.com',
				password : 'abcdef123'
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
					password : 'abcdef123'
				},this.callback);
			},
			'should fail with an error' : testUtils.assertFailure(codes.error.USER_EMAIL_EXISTS)
		},
		'with invalid email' : {
			topic : function(){
				client.create({
					email : 'abcde',
					password : 'abcdef123'
				},this.callback);
			},
			'should fail with an error' : testUtils.assertFailure(codes.error.NOT_VALID_EMAIL)
		},
		'with invalid password' : {
			topic : function(){
				client.create({
					email : 'xyz@abc.com',
					password : 'abcd'
				},this.callback);
			},
			'should fail with an error' : testUtils.assertFailure(codes.error.PASSWORD_TOO_SHORT)
		},
		'without password' : {
			topic : function(){
				client.create({
					email : 'pqr@abc.com'
				},this.callback);
			},
			'should fail with an error' : testUtils.assertFailure(codes.error.PASSWORD_TOO_SHORT)
		}
	},
	
	'A POST on User 2' : {
		topic : function(){
			client.create({
				email : 'pqr@abc.com',
				password : 'abcdef123'
			},this.callback);
		},
		'should create an User' : testUtils.assertSuccess,
		'should have an Id' : function(err, res){
			id2 = res.body.data.id;
			assert.isNotNull(id2);
		},
		'should not be verified' : function(err, res){
			assert.isFalse(res.body.data.isVerified);
		},
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
	'A PUT on User with Id and short password' : {
		topic : function(){
			client.update(id, {password : 'abcd'}, this.callback);
		},
		'should fail with an error' : testUtils.assertFailure(codes.error.PASSWORD_TOO_SHORT)
	},
}).addBatch({
	'A POST on User authenticate' : {
		topic : function(){
			client.authenticate('xyz@abc.com', 'abcpqr', this.callback);
		},
		'should authenticate the user' : testUtils.assertSuccess,
	},
	'A POST on User authenticate for a non-verified user ' : {
		topic : function(){
			client.authenticate('pqr@abc.com', 'abcdef123', this.callback);
		},
		'should fail with an error' : testUtils.assertFailure(codes.error.EMAIL_NOT_VERIFIED)
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
}).addBatch({
	'A POST on User signup' : {
		topic : function(){
			client.signup('abc@abc.com', 'abcpqr', this.callback);
		},
		'should signup the user' : testUtils.assertSuccess,
	}
})
.addBatch({
	'A POST on User forgot' : {
		topic : function(){
			client.forgot('abc@abc.com', this.callback);
		},
		'should send a recovery mail to user' : testUtils.assertSuccess,
		'with non-existent email' : {
			topic : function(){
				client.forgot('def@abc.com', this.callback);
			},
			'should fail with an error' : testUtils.assertFailure(codes.error.EMAIL_DOES_NOT_EXISTS)
		},
	}
})
.addBatch({
	'A POST on User Send Verification' : {
		topic : function(){
			client.sendVerificationEmail('abc@abc.com', this.callback);
		},
		'should send a verification mail to user' : testUtils.assertSuccess,
	}
})
.export(module);