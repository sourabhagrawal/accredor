/**
 * Module that should serve for all the Success and Error coded to returned from APIs
 */

/**
 * @private
 * Substitute values in a message.
 * Will throw an error if insufficient number of parameters is provided.
 * If excess of parameters are provided then it will ignore them
 * @param message
 * @param params
 */
var substitute = function(message, params){
	if(params != undefined){
        params.forEach(function(param, index, arr){
        	// Search for index in message and replace with param. e.g. {1} for index 1
            message = message.replace("{" + (index + 1) + "}", param);
        });
        if(message.match("{[0-9]*}")){ // If placeholders left for substitution
            throw "Insufficient substitution values (Provided : " + params.length + ")";
        };
    }
    return message;
};

/**
 * Returns a function that would 
 * 	-> generate the substitued message if called with parameters.
 * 	-> Return the message itself if converted to string
 * @param message
 */
var message = function(message){
	var foo = function(options){
		return substitute(message, options);
	};
	
	foo.toString = function(){
		return message;
	};
	
	return foo;
};

/**
 * Returns a function that would generate a status code if called with options.
 */
var status = function(opts){
	var foo = function(options){
		return {code : opts.code, message : substitute(opts.message, options)};
	};
	
	foo.toString = function(){
		return opts;
	};
	
	foo.equals = function(obj){
		return obj.code == opts.code;
	};
	
	return foo;
};

/**
 * Success Codes
 */
var SuccessCodes = new function(){
	this.OPERATION_SUCCESSFULL = "Operation was successfull";
	this.RECORD_FETCHED = message("{1} : {2} fetched successfully");
	this.RECORD_CREATED = message("{1} created successfully");
	this.RECORD_UPDATED = message("{1} : {2} updated successfully");
	this.RECORD_DELETED = message("{1} : {2} deleted successfully");
	this.RECORDS_SEARCHED = message("{1}s searched successfully");
	this.USER_EMAIL_EXISTS = message("User found");
};

/**
 * Error codes.
 */
var ErrorCodes = new function(){
	this.UNKNOWN_ERROR = status({code : 1001, message : "An unknown error occurred"});
	this.ID_NULL = status({code : 1101, message : "Id can not be null"});
	this.RECORD_WITH_ID_NOT_EXISTS = status({code : 1102, message : "{1} with id : {2} does not exist"});
	this.RECORD_WITH_ID_NOT_FETCHED = status({code : 1103, message : "{1} with id : {2} could not be fetched"});
	this.CREATION_FAILED = status({code : 1104, message : "{1} could not be created"});
	this.UPDATION_FAILED = status({code : 1105, message : "{1} with id : {2} could not be updated"});
	this.DELETION_FAILED = status({code : 1106, message : "{1} with id : {2} could not be deleted"});
	this.SEARCH_FAILED = status({code : 1107, message : "Search on {1}s could not be completed"});
	this.FIELD_REQUIRED = status({code : 1108, message : "{1} can not be empty"});
	
	this.EXPERIMENT_USER_ID_NAME_EXISTS = status({code : 1201, message : "Experiment with this Name already exists"});
	this.VARIATION_EXPERIMENT_ID_NAME_EXISTS = status({code : 1301, message : "Variation with this Name already exists for this experiment"});
	this.USER_EMAIL_EXISTS = status({code : 1501, message : "This email is already registered"});
	this.USER_EMAIL_CANT_BE_CHANGED = status({code : 1502, message : "The email can not be changed"});
	this.EMAIL_OR_PASSWORD_NULL = status({code : 1503, message : "Email or Password is empty"});
	this.EMAIL_OR_PASSWORD_INCORRECT = status({code : 1504, message : "Email or Password is incorrect"});
};

exports.success = SuccessCodes;
exports.error = ErrorCodes;