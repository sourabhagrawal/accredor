var comb = require('comb');
var codes = require('./codes');

/**
 * A response object to be returned from Impls to the Routes through callbacks
 * To maintain the Node convention of function(error, data) the following will be done : 
 * 1. Success :- data will be constructed as 
 * 		{
 * 			status : {
 * 				code : num, 
 * 				message : string
 * 			},
 * 			totalCount : num,
 * 			data : object/array
 * 		}
 * 2. Error :- error will be constructed as
 * 		{
 * 			code : num,
 * 			message : string
 *  	}
 *  
 *  Codes and Messages must be externalized and in case of errors unique to stories and use-cases 
 */
var Response = new function(){
	/**
	 * totalCount : 0 by default
	 */
	this.success = function(data, totalCount, message){
		if(typeof message == 'function')
			message = message.toString();
		
		return {
			status : {code : 1000, message : message || codes.success.OPERATION_SUCCESSFULL},
			totalCount : totalCount || 0,
			data : data || {}
		};
	};
	
	this.error = function(status){
		if(typeof status.message == 'function')
			status.message = status.message.toString();
		
		status = status || codes.error.UNKNOWN_ERROR;
		return {
			code : status.code,
			message : status.message
		};
	};
};

module.exports = Response;