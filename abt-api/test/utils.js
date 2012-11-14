var vows = require('vows'),
    assert = require('assert'),
    request = require('request'),
    _ = require('underscore');

exports.assertSuccess = function(err, res){
	assert.isNull(err);
	
	var body = res.body;
	if(!_.isObject(body)){
		try{
			body = JSON.parse(body);
		}catch(e){
			console.log(body);
			throw e;
		}
	}
	assert.isObject(body);
	assert.isObject(body.status);
	assert.equal(body.status.code, 1000);
};

exports.assertFailure = function(status){
	return function(err, res){
		assert.isNull(err);
		
		var body = res.body;
		if(!_.isObject(body)){
			try{
				body = JSON.parse(body);
			}catch(e){
				console.log(body);
				throw e;
			}
		}
		assert.isObject(body);
		assert.isTrue(status.equals(body));
	};
};