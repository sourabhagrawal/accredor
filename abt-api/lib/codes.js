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

var _ = require('underscore');

var substitute = function(message, params){
	if(params != undefined){
        _.each(params, function(param, index, arr){
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
	var foo = function(){
		var options = undefined;
		
		if(arguments.length > 0)
			options = [];
		
		var firstArgument = arguments[0];
		if(_.isArray(firstArgument)){
			for(var i = 0; i < firstArgument.length; i++){
				options[i] = firstArgument[i];
			}
		}else{
			for(var i = 0; i < arguments.length; i++){
				options[i] = arguments[i];
			}
		}
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
	var foo = function(){
		var options = undefined;
		
		if(arguments.length > 0)
			options = [];
		
		var firstArgument = arguments[0];
		if(_.isArray(firstArgument)){
			for(var i = 0; i < firstArgument.length; i++){
				options[i] = firstArgument[i];
			}
		}else{
			for(var i = 0; i < arguments.length; i++){
				options[i] = arguments[i];
			}
		}
		
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
	/**
	 * Common Success codes
	 */
	this.OPERATION_SUCCESSFULL = "Operation was successfull";
	this.RECORD_FETCHED = message("{1} : {2} fetched successfully");
	this.RECORD_CREATED = message("{1} created successfully");
	this.RECORD_UPDATED = message("{1} : {2} updated successfully");
	this.RECORD_DELETED = message("{1} : {2} deleted successfully");
	this.RECORDS_SEARCHED = message("{1}s searched successfully");
	
	/**
	 * Sign-up and Authentication related
	 */
	this.USER_EMAIL_EXISTS = message("User found");
	this.TOKEN_VALID = message("URL token is valid");
	
	/**
	 * Email related
	 */
	this.EMAIL_BATCH_UPDATED = message("Email batch update successful");
};

/**
 * Error codes.
 */
var ErrorCodes = new function(){
	/**
	 * Common Error codes
	 */
	this.UNKNOWN_ERROR = status({code : 1001, message : "An unknown error occurred"});
	this.ID_NULL = status({code : 1101, message : "Id can not be null"});
	this.RECORD_WITH_ID_NOT_EXISTS = status({code : 1102, message : "{1} with id : {2} does not exist"});
	this.RECORD_WITH_ID_NOT_FETCHED = status({code : 1103, message : "{1} with id : {2} could not be fetched"});
	this.CREATION_FAILED = status({code : 1104, message : "{1} could not be created"});
	this.UPDATION_FAILED = status({code : 1105, message : "{1} with id : {2} could not be updated"});
	this.DELETION_FAILED = status({code : 1106, message : "{1} with id : {2} could not be deleted"});
	this.SEARCH_FAILED = status({code : 1107, message : "Search on {1}s could not be completed"});
	this.FIELD_REQUIRED = status({code : 1108, message : "{1} can not be blank"});
	this.VALID_USER_REQUIRED = status({code : 1109, message : "Valid user not found"});
	
	/**
	 * Experiments related
	 */
	this.EXPERIMENT_USER_ID_NAME_EXISTS = status({code : 1201, message : "Experiment with this Name already exists"});
	this.EXPERIMENT_USER_ID_CANT_UPDATE = status({code : 1202, message : "Can't update the User of an Experiment"});
	this.EXPERIMENT_NAME_REQUIRED = status({code : 1203, message : "Experiment Name can not be blank"});
	this.EXPERIMENT_URL_EMPTY = status({code : 1204, message : "Experiment URL can not be blank"});
	this.EXPERIMENT_TYPE_REQUIRED = status({code : 1205, message : "Experiment Type can not be blank"});
	this.EXPERIMENT_TYPE_CANT_UPDATE = status({code : 1206, message : "Can't update the type of a Experiment"});
	this.INVALID_EXPERIMENT_URL = status({code : 1207, message : "Experiment URL is not a valid URL"});
	
	/**
	 * Variations related
	 */
	this.VARIATION_EXPERIMENT_ID_NAME_EXISTS = status({code : 1301, message : "Variation with this Name already exists for this experiment"});
	this.VARIATION_NAME_REQUIRED = status({code : 1302, message : "Variation Name can not be blank"});
	this.VARIATION_TYPE_REQUIRED = status({code : 1303, message : "Variation Type can not be blank"});
	this.VARIATION_CONTROL_EXISTS = status({code : 1304, message : "Control Variation already exists for this experiment"});
	this.VARIATION_EXPERIMENT_ID_CANT_UPDATE = status({code : 1305, message : "Can't update the Experiment of a Variation"});
	this.VARIATION_TYPE_CANT_UPDATE = status({code : 1306, message : "Can't update the type of a Variation"});
	
	/**
	 * Goals Related
	 */
	this.GOAL_USER_ID_NAME_EXISTS = status({code : 1401, message : "Goal with this Name already exists"});
	this.GOAL_USER_ID_CANT_UPDATE = status({code : 1402, message : "Can't update the User of a Goal"});
	this.GOAL_NAME_REQUIRED = status({code : 1403, message : "Goal name can not be blank"});
	this.GOAL_TYPE_REQUIRED = status({code : 1404, message : "Goal Type can not be blank"});
	this.GOAL_URL_REQUIRED = status({code : 1405, message : "Goal URL can not be blank"});
	this.INVALID_GOAL_URL = status({code : 1406, message : "Goal URL not a valid URL"});
	
	/**
	 * Sign-up and Authentication related
	 */
	this.USER_EMAIL_EXISTS = status({code : 1501, message : "This email is already registered"});
	this.USER_EMAIL_CANT_BE_CHANGED = status({code : 1502, message : "The email can not be changed"});
	this.EMAIL_OR_PASSWORD_NULL = status({code : 1503, message : "Email or Password is empty"});
	this.EMAIL_OR_PASSWORD_INCORRECT = status({code : 1504, message : "Email or Password is incorrect"});
	this.EMAIL_DOES_NOT_EXISTS = status({code : 1505, message : "This email is not registered"});
	this.EMAIL_NULL = status({code : 1506, message : "Email is empty"});
	this.EMAIL_NOT_VERIFIED = status({code : 1507, message : "This email id is not verified. " +
			"Please follow the Verification mail sent to your email id. <br />In case you haven't received it " +
			"<a href='#' id='send-verification-btn'>Click Here</a>"});
	this.TOKEN_INVALID = status({code : 1508, message : "The URL Token is invalid. Please check if you pasted the correct url given in the email"});
	this.TOKEN_EXPIRED = status({code : 1509, message : "The URL Token has expired"});
	this.NOT_VALID_EMAIL = status({code : 1510, message : "The email is not a valid email address"});
	this.PASSWORD_TOO_SHORT = status({code : 1511, message : "The password should be atleast {1} characters long"});
	
	
	/**
	 * Transitions related
	 */
	this.TRANSITION_NOT_ALLOWED = status({code : 1601, message : "Transition not allowed from {1} to {2} in entity : {3}"});
	this.STATE_NOT_FOUND = status({code : 1602, message : "State with name : {1} for entity : {2} does not exists"});
	this.STATE_NOT_START_STATE = status({code : 1603, message : "State with name : {1} for entity : {2} is not the start state"});
	this.START_STATE_NOT_FOUND = status({code : 1604, message : "Start state for entity : {1} does not exists"});
	
	/**
	 * Email related
	 */
	this.EMAIL_BATCH_UPDATE_FAILED = status({code : 1701, message : "Batch update for email failed"});
	this.EMAIL_BODY_NOT_BUILT = status({code : 1702, message : "Email body could not be built."});
	
	/**
	 * Links related
	 */
	this.LINK_URL_REQUIRED = status({code : 1801, message : "Link URL can not be blank"});
	this.INVALID_LINK_URL = status({code : 1802, message : "Link URL not a valid URL"});
	
	/**
	 * Script Details related
	 */
	this.SCRIPT_DETAILS_EXISTS = status({code : 1901, message : "Script Details already exists for this user"});
	this.SCRIPT_DETAILS_USER_ID_CANT_UPDATE = status({code : 1902, message : "User for Script Details can't be updated"});
	this.SCRIPT_DETAILS_FILE_NAME_CANT_UPDATE = status({code : 1903, message : "File Name for this user can't be updated"});
	
	/**
	 * Variation Visits related
	 */
	this.EXPERIMENT_ID_NULL = status({code : 2001, message : "Experiment Id can not be empty"});
	this.VARIATION_ID_NULL = status({code : 2002, message : "Variation Id can not be empty"});
	this.GOAL_ID_NULL = status({code : 2003, message : "Goal Id can not be empty"});
	this.VISITS_NULL = status({code : 2004, message : "Visits can not be empty"});
	this.HITS_NULL = status({code : 2005, message : "Hits can not be empty"});
	
};

exports.success = SuccessCodes;
exports.error = ErrorCodes;